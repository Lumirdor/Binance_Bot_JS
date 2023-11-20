require('dotenv').config();
const Binance = require('node-binance-api');
const MARKET = 'BTCBUSD';
let precio_actual;

const sleep = (timeMs) => new Promise(resolve => setTimeout(resolve, timeMs));

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET
});

async function broadcast(){
    do{
        console.clear();
        console.log("\nPrecio actual BTC/BUSD: ", precio_actual);

        try{
            await binance.prices(MARKET, (error, ticker) => {
            precio_actual = ticker.BTCBUSD;
            if(error) console.log("Error de lectura de datos");
            });
        }catch(error) {console.log(error);}//continue;}
        console.log("\nPrecio actual BTC/BUSD: ", precio_actual);
        await sleep(process.env.SLEEP_TIME);
    }while(true);
}

broadcast();