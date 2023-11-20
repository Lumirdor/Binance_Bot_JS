require('dotenv').config();
const Binance = require('node-binance-api');
const MARKET = 'BTCBUSD';
let precio_actual=32000;
let limite_inferior = 29000;
let limite_superior = 31000;
let rango = true;

const sleep = (timeMs) => new Promise(resolve => setTimeout(resolve, timeMs));

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET
});

async function colocar2ordenes(quantity,precio_compra,precio_venta) {//Recibe la cantidad en BTC, el precio de compra y precio de venta
    try{
      //Coloco orden de compra un % por debajo y una de venta un % por encima
        binance.buy("BTCBUSD", quantity, precio_compra, {type:'LIMIT'}, (error, response) => {
        ordenCompraId = response.orderId;
        if(error)console.log("Error al colocar orden de compra",error);
        });

        binance.sell("BTCBUSD", quantity, precio_venta, {type:'LIMIT'}, (error, response) => {
        ordenVentaId = response.orderId;
        if(error)console.log("Error al colocar orden de venta",error);
        });

    }catch(error){console.log("Error al colocar las ordenes de Compra/Venta", error)}
}


async function Leer_datos_binance(){
    //leer precio
    //leer balance
    //leer ordenes abiertas
    //retornar array
}

function Dibujar(precio_ref,precio_actual,disponibleBTC,disponibleBUSD,balanceBTC,balanceBUSD,balanceTotalBUSD,gananciasSesion,porcent,ordenCompra,ordenVenta,mensaje){
    console.clear();
    console.info("Estado:", mensaje);
    console.log("\nPrecio referencia BTC/BUSD: ", precio_ref);
    console.info("Precio actual del BTC/BUSD: ", precio_actual);
    console.log("\n========== Balances ===========");
    console.info("BTC disponible: ", disponibleBTC);
    console.info("BUSD disponible: ", disponibleBUSD);
    console.info("BTC balance: ", balanceBTC);
    console.info("BUSD balance: ", balanceBUSD);
    //console.info("Balance total en BUSD:", balanceTotalBUSD);
    //console.info("Ganancias de la sesion en BUSD:", gananciasSesion);
    //console.info("Ganancias acumuladas BUSD:", gananciasTotales);
    //console.info("Porcentaje acumulado desde 13/07/22:", profitPercent);
    console.log("\n====== Porcentaje de variacion de precio =======");
    console.log('Variacion:'+ porcent + '%');
    console.log("\n========== Ordenes abiertas ===========");
    console.log(ordenCompra);
    console.log(ordenVenta);
}

function miFuncion(){
    console.log('Hola desde mi Funcion en operative_functions');
}

async function sleep_and_await(limite_inf, limite_sup){
    do{
        rango = true;
        console.clear();
        console.log("\nPrecio actual BTC/BUSD: ", precio_actual);
        console.log("\nLimite inferior: ", limite_inf);
        console.log("\nLimite superior: ", limite_sup);
        console.log("\nBot en pausa: Fuera de rango de operación");
/*
        try{
            await binance.prices(MARKET, (error, ticker) => {
            precio_actual = ticker.BTCBUSD;
            if(error) console.log("Error de lectura de datos");
            });
        }catch(error) {console.log(error);continue;}
*/
        if (precio_actual > limite_inferior && precio_actual < limite_superior ){
            rango = false;}//Si entra al rango sale del bucle
            else rango = true;
        await sleep(process.env.SLEEP_TIME);
    }while(true);
}

async function colocarParOrdenes() {//Recibe la cantidad en BTC, el precio de compra y precio de venta
    try{
      //Coloco orden de compra un % por debajo y una de venta un % por encima
        binance.buy("BTCBUSD", quantity, precio_compra, {type:'LIMIT'}, (error, response) => {
            ordenCompraId = response.orderId;
        if(error)console.log("Error al colocar orden de compra",error);
        });
        binance.sell("BTCBUSD", quantity, precio_venta, {type:'LIMIT'}, (error, response) => {
        ordenVentaId = response.orderId;
        if(error)console.log("Error al colocar orden de venta",error);
        });
    }catch(error){console.log("Error al colocar las ordenes de Compra/Venta", error)}
}

//sleep_and_await(limite_inferior, limite_superior);
module.exports = {
    sleep_and_await: sleep_and_await,
    miFuncion: miFuncion,
    Dibujar: Dibujar,
    colocar2ordenes: colocar2ordenes
};