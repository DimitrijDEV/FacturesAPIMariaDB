const express = require('express')
const { sendQuery } = require('./scripts/db')
const { getResponse } = require('./scripts/response')
const { createFacture } = require('./scripts/factures')
const app = express()
const port = process.env.PORT || 5000

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => console.log(`Listening on port ${port}`));


app.get('/factures', async (req, res) => {
    const queryDB = `select * from factures;`;

    try {
        const factures = await sendQuery(queryDB);

        res.send(
            getResponse(true, factures, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], "We didn't get results")
        )
    }
});

app.get('/clients', async (req, res) => {
    const queryDB =
        `select p.name as client_name, comp.name as client_company, phone, number_tax, email, currency, bill, street, postal_code, city, country from clients cl` +
        ` inner join people p on p.person_id = cl.person_id ` +
        ` inner join companies comp on comp.company_id = p.company_id` +
        ` inner join addresses a on a.address_id = cl.address_id`;

    try {
        const clients = await sendQuery(queryDB);

        res.send(
            getResponse(true, clients, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], "We didn't get results")
        )
    }
});


app.get('/sellers', async (req, res) => {

    const queryDB =
        `select p.name as seller_name, comp.name as seller_company, phone, number_tax, email, currency, bill, street, postal_code, city, country from sellers sl` +
        ` inner join people p on p.person_id = sl.person_id ` +
        ` inner join companies comp on comp.company_id = p.company_id` +
        ` inner join addresses a on a.address_id = sl.address_id`;

    try {
        const sellers = await sendQuery(queryDB);

        res.send(
            getResponse(true, sellers, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], "We didn't get results")
        )
    }
});

app.post('/find-client', async (req, res) => {
    const
        { client_id } = req.body,
        queryDB =
            `select p.name as client_name, comp.name as client_company, phone, number_tax, email, currency, bill, street, postal_code, city, country from clients cl` +
            ` inner join people p on p.person_id = cl.person_id ` +
            ` inner join companies comp on comp.company_id = p.company_id` +
            ` inner join addresses a on a.address_id = cl.address_id` +
            ` where client_id = ${client_id};`;

    try {
        const client = await sendQuery(queryDB);

        res.send(
            getResponse(true, client, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], "We didn't get results")
        )
    }
});

app.post('/find-seller', async (req, res) => {

    const
        { seller_id } = req.body,
        queryDB =
            `select p.name as seller_name, comp.name as seller_company, phone, number_tax, email, currency, bill, street, postal_code, city, country from sellers sl` +
            ` inner join people p on p.person_id = sl.person_id ` +
            ` inner join companies comp on comp.company_id = p.company_id` +
            ` inner join addresses a on a.address_id = sl.address_id` +
            ` where seller_id = ${seller_id};`;

    try {
        const seller = await sendQuery(queryDB);

        res.send(
            getResponse(true, seller, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], "We didn't get results")
        )
    }
});

app.post('/find-orders', async (req, res) => {

    const
        { number_facture } = req.body,
        queryDB =
            `select number_facture, quantity, name, unit, currency, price, tax from orders` +
            ` inner join products pr on pr.product_id = orders.product_id` +
            ` where number_facture = '${number_facture}'`;

    try {
        const orders = await sendQuery(queryDB);

        res.send(
            getResponse(true, orders, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], "We didn't get results")
        )
    }
});

app.post('/create-facture', async (req, res) => {

    const {
        client_id,
        seller_id,
        products,
        sell_date,
        payment_date,
        issue_date,
        status
    } = req.body;

    if (
        client_id > 0 &&
        seller_id > 0 &&
        products.length > 0 &&
        sell_date !== "" &&
        payment_date !== "" &&
        issue_date !== "" &&
        status === "paid" ||
        status === "partially" ||
        status === "unpaid"
    ) {
        try {

            const factureInfo = {
                client_id,
                seller_id,
                products,
                sell_date,
                payment_date,
                issue_date,
                status
            }

            const created_facture = await createFacture(factureInfo);

            res.send(
                getResponse(true, created_facture, 'We got results')
            )
        } catch (error) {
            res.send(
                getResponse(false, [], "The facture wasn't created")
            )
        }
    } else {
        res.send(
            getResponse(false, [], "The facture wasn't created")
        );
    }
});

app.delete('/delete-facture/:number_facture', async (req, res) => {
    const
        { number_facture } = req.params,
        deleteFacture = `delete from factures where number_facture = '${number_facture}'`,
        deleteOrders = `delete from orders where number_facture = '${number_facture}'`;

    try {
        await sendQuery(deleteFacture);
        await sendQuery(deleteOrders);

        res.send(
            getResponse(true, [], "The facture was deleted")
        );
    } catch (error) {
        res.send(
            getResponse(false, [], "The facture wasn't deleted")
        );
    }
});

