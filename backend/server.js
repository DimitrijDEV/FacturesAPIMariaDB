const express = require('express')
const { sendQuery } = require('./scripts/MSdb')
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
            getResponse(false, [], error)
        )
    }
});

app.get('/orders', async (req, res) => {
    const queryDB = `select * from orders;`;

    try {
        const factures = await sendQuery(queryDB);

        res.send(
            getResponse(true, factures, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], error)
        )
    }
});

app.get('/people', async (req, res) => {
    const queryDB = `select * from people`;

    try {
        const clients = await sendQuery(queryDB);

        res.send(
            getResponse(true, clients, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], error)
        )
    }
});

app.post('/find-client', async (req, res) => {
    const
        { client_id } = req.body,
        queryDB =
            `select person_name as client_name, company_name, number_phone, number_tax, email, currency, bill, street, postal_code, city, country from people`+
            ` where person_id = ${client_id};`;

    try {
        const client = await sendQuery(queryDB);

        res.send(
            getResponse(true, client, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], error)
        )
    }
});

app.post('/find-seller', async (req, res) => {

    const
        { seller_id } = req.body,
        queryDB =
            `select person_name as seller_name, company_name, number_phone, number_tax, email, currency, bill, street, postal_code, city, country from people` +
            ` where person_id = ${seller_id};`;

    try {
        const seller = await sendQuery(queryDB);

        res.send(
            getResponse(true, seller, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], error)
        )
    }
});

app.post('/find-orders', async (req, res) => {

    const
        { number_facture } = req.body,
        queryDB =
            `select number_facture, quantity, product_name, unit, currency, price, tax from orders` +
            ` inner join products pr on pr.product_id = orders.product_id` +
            ` where number_facture = '${number_facture}'`;

    try {
        const orders = await sendQuery(queryDB);

        res.send(
            getResponse(true, orders, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], error)
        )
    }
});

app.post('/find-facture', async (req, res) => {

    const
        {
            client_nip,
            start_date,
            final_date
        } = req.body,
        queryDB =
            `select facture_id, number_facture, number_tax, facture_status, payment_date, price_brutto from factures f` +
            ` inner join people p on p.person_id = f.client_id`+
            ` where number_tax = ${client_nip} AND issue_date = '${start_date}' AND sell_date = '${final_date}'`;
       
    try {
        const factures = await sendQuery(queryDB);

        res.send(
            getResponse(true, factures, 'We got results')
        )
    } catch (error) {
        res.send(
            getResponse(false, [], error)
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
                getResponse(false, [], error)
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
            getResponse(false, [], error)
        );
    }
});

