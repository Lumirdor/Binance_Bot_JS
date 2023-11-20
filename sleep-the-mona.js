require('dotenv').config();
const Binance = require('node-binance-api');
const MARKET = 'BTCBUSD';
let precio_actual;
let limite_inferior = 29000;
let limite_superior = 31000;
let rango = true;

const sleep = (timeMs) => new Promise(resolve => setTimeout(resolve, timeMs));

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET
});

async function sleep_and_await(limite_inf, limite_sup){
    do{
        console.clear();
        console.log("\nPrecio actual BTC/BUSD: ", precio_actual);
        console.log("\nLimite inferior: ", limite_inf);
        console.log("\nLimite superior: ", limite_sup);
        console.log("\nBot en pausa: Fuera de rango de operación");

        try{
            await binance.prices(MARKET, (error, ticker) => {
            precio_actual = ticker.BTCBUSD;
            if(error) console.log("Error de lectura de datos");
            });
        }catch(error) {console.log(error);continue;}

        if (precio_actual > limite_inferior || precio_actual < limite_superior ){
            rango = false;}//Si esta fuera de rango sale del bucle

        await sleep(process.env.SLEEP_TIME);
    }while(rango);
}

sleep_and_await(limite_inferior, limite_superior);