const { sendQuery } = require('./db')

const createFacture = async (info) => {

    let sumNetto = 0, sumBrutto = 0;

    const
        products = await sendQuery("select * from products"),
        currentDate = Date.now() + "",
        number_facture = "A" + info.client_id + info.seller_id + currentDate.substr(5);

    for (const product of info.products) {
        let foundProduct = products.find(obj => obj.product_id === product.product_id);

        if (foundProduct !== undefined) {
            let priceNetto = 0, priceBrutto = 0, priceTax = 0;

            priceNetto = product.amount * foundProduct.price;
            priceTax = (priceNetto * foundProduct.tax) / 100;
            priceBrutto = priceNetto + priceTax;

            sumNetto += priceNetto;
            sumBrutto += priceBrutto;

            await sendQuery(
                `insert into orders (product_id, number_facture, quantity) values (${product.product_id}, '${number_facture}', ${product.amount})`
            );
            
        }
    }

    const facture = {
        client_id: info.client_id,
        seller_id: info.seller_id,
        number_facture,
        sell_date: info.sell_date,
        payment_date: info.payment_date,
        issue_date: info.issue_date,
        status: info.status,
        price_netto: sumNetto.toFixed(2),
        price_brutto: sumBrutto.toFixed(2)
    }

    await sendQuery(
        `insert into factures (client_id, seller_id, number_facture, sell_date, payment_date, issue_date, status, price_netto, price_brutto)` +
        ` values` + 
        ` (${facture.client_id}, ${facture.seller_id}, '${facture.number_facture}', '${facture.sell_date}', '${facture.payment_date}',` +
        ` '${facture.issue_date}', '${facture.status}', ${facture.price_netto}, ${facture.price_brutto} )`
    )

    return facture;
}

exports.createFacture = createFacture;
 