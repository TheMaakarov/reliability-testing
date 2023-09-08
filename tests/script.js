import http from "k6/http";
import { sleep, check } from "k6";
import { SharedArray } from "k6/data";

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

const customers = new SharedArray('all my customers', function () {
    return JSON.parse(open('./customers.json')).customers;
});

export let options = {
    stages: [
        { duration: "10s", target: 10 },
        { duration: "5s", target: 100 },
    ],
    thresholds: {
        "http_req_duration": ["p(95)<1"],
    },
};

export function setup() {
    let res = http.get(BASE_URL)
    if (res.status !== 200) {
        throw new Error(`Got unexpected status code ${res.status} when trying to setup. Exiting.`)
    }
}

export function teardown(data) {
    // do nothing
}

export default function () {
    let restrictions = {
        maxCaloriesPerSlice: 500,
        mustBeVegetarian: false,
        excludedIngredients: ["pepperoni"],
        excludedTools: ["knife"],
        maxNumberOfToppings: 6,
        minNumberOfToppings: 2
    }
    let res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(restrictions), {
        headers: {
            'Content-Type': 'application/json',
            'X-User-ID': customers[Math.floor(Math.random() * customers.length)],
        },
    });
    console.log(`${res.json().pizza.name} (${res.json().pizza.ingredients.length} ingredients)`);
    check(
        res,
        {
            "is status 200": (r) => r.status == 200,
        });
    sleep(1)
}