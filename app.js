require('dotenv').config();
const fs = require ('fs');
const Binance = require('node-binance-api');
const Archivos = require('./models/archivos');
const {sleep_and_await, miFuncion, Dibujar, colocar2ordenes} = require('./operative_functions');

let dbGain = './db/gaindata.json';
let precio_ref;
let precio_actual;
let precio_venta;
let precio_compra;
let quantity = 0.001; //30usd
let ordenCompraId;
let ordenVentaId;
let balanceBTC;
let balanceBUSD;
let balanceTotalBUSD;
let disponibleBUSD;
let disponibleBTC;
let gananciasSesion = 0;
let gananciasTotales = 0;
let profitPercent = 0;
let porcent = 0;
let soportes = [29700,30000,30300,30600,30900,31200];


let ordenCompra = {};
let ordenVenta = {};
//const archivo = './db/data.json';
const MARKET = 'BTCBUSD';
const archivos = new Archivos;

const sleep = (timeMs) => new Promise(resolve => setTimeout(resolve, timeMs));

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET
  });

let orden = {
  id: '',
  tipo: '',
  precio: 0,
  cant: 0,
  gain: 0
};

let ordenes = [];

async function calcularBalances (){
  binance.balance((error, balances) => {
  if ( error ) return console.error("Error al obtener balances"+error);
  else{
      disponibleBUSD = parseFloat(balances.BUSD.available);
      disponibleBTC = parseFloat(balances.BTC.available);
      balanceBUSD = disponibleBUSD + quantity*ordenCompra.precio;
      balanceBTC = disponibleBTC + quantity;
      balanceTotalBUSD = balanceBUSD + parseFloat(balanceBTC * precio_actual);
  }
  });
}

async function broadcast(){
    do{
      
          Dibujar(precio_ref,precio_actual,disponibleBTC,disponibleBUSD,balanceBTC,balanceBUSD,balanceBUSD,gananciasSesion,porcent,ordenCompra,ordenVenta,"Bot en linea, operando normalmente");

          
          //Primero leo el precio de la moneda en cuastion
          try{
            await binance.prices(MARKET, (error, ticker) => {
              precio_actual = ticker.BTCBUSD;
              if(error) console.log("Error de lectura de precios de mercado");
            });
          }catch(error){console.log("Catch: Error de lectura de precios de mercado");continue;}// {console.log(error);continue;}

          
          //Calculo el porcentaje de variacion del precio
          porcent = parseFloat(((precio_actual - precio_ref)/precio_ref)*100);//.toFixed(2);




      if(precio_actual > soportes[0] && precio_actual<soportes[5]){
        //Funcion de Venta: Si supero el porcentaje definido vendo
        if (porcent >= process.env.PRICE_PERCENT){ 
          //Cancelo la orden de compra que queda mucho mas abajo ya que no es necesaria
            binance.cancel("BTCBUSD",ordenCompra.id, error=>{
            console.log("No hay ordenes de COMPRA para borrar", error);
          })
          //Calculo los nuevos precios de compra/venta a los que colocar las ordenes nuevas
          precio_venta = Math.trunc(precio_actual * (1 + process.env.PRICE_PERCENT/100));
          precio_compra = Math.trunc(precio_actual * (1 - process.env.PRICE_PERCENT/100));

          //colocarParOrdenes();//Coloco una orden de compra y una de venta *** BORRAR ****
          colocar2ordenes(quantity,precio_compra,precio_venta);

          
          //Calcular beneficios
          //let beneficioUSD = (precio_actual - precio_ref)*quantity;//Beneficio en busd
          //let beneficioPorcent = process.env.PRICE_PERCENT/(quantity*precio_actual);

          //Calculo de benficios (Mejorar con un archivo csv)
          ordenVenta.gain = (precio_actual - precio_ref)*quantity;
          gananciasSesion += ordenVenta.gain;
          gananciasTotales += ordenVenta.gain;
          profitPercent = (gananciasTotales/balanceTotalBUSD)*100;
          precio_ref=precio_actual;

          //Guardo todo en archivos Json
          archivos.guardarObjeto(dbGain,ordenVenta);
          archivos.agregarHistorial(gananciasTotales);
          archivos.guardarDB();
        }

        //Funcion de Compra: Si bajo por debajo del porcentaje definido compro
        if (porcent <= -process.env.PRICE_PERCENT){ 
            //Cancelo la orden de venta que queda mucho mas arriba ya que no es necesaria
            binance.cancel("BTCBUSD",ordenVenta.id, error=>{
            console.log("No hay ordenes de VENTA para borrar");
            })

          //Calculo los nuevos precios de compra/venta a los que colocar las ordenes nuevas
          precio_venta = Math.trunc(precio_actual * (1 + process.env.PRICE_PERCENT/100));
          precio_compra = Math.trunc(precio_actual * (1 - process.env.PRICE_PERCENT/100));

          //colocarParOrdenes();//Coloco una orden de compra y una de venta **** BORRAR ****
          colocar2ordenes(quantity,precio_compra,precio_venta);

          //let info = 'Orden de COMPRA a: '+ precio_actual;
          precio_ref=precio_actual;
          //archivos.agregarHistorial(info);
          //archivos.guardarDB();
        }


      }
      else Dibujar(precio_ref,precio_actual,disponibleBTC,disponibleBUSD,balanceBTC,balanceBUSD,balanceBUSD,gananciasSesion,porcent,ordenCompra,ordenVenta,"Bot fuera de rango");
      
//Funcion actualizar info de ordenes abiertas          
await binance.openOrders(false, (error, openOrders) => {
  openOrders.forEach((ele,i) => {
  orden.id = ele.orderId;
  orden.tipo = ele.side;
  orden.precio = ele.price;
  orden.cant = ele.origQty;
  
  if(ele.side == 'BUY')ordenCompra = orden;
  else if(ele.side == 'SELL')ordenVenta = orden;
  else{("No se encontraron ordenes de compra o venta");}// ordenCompra='';ordenVenta='';};
  orden = {};
  if(error)console.log("Error al buscar ordenes abiertas");
});  
if(error)console.log("Error al actualizar informacion de ordenes");
});
      
      calcularBalances();
      await sleep(process.env.SLEEP_TIME)
    }while(true);
}


const iniciar = async() => {
  archivos.leerDBgain(dbGain);
  gananciasTotales = archivos.leerDB();
  try{
    await binance.prices(MARKET, (error, ticker) => {/******** QUEDA IGUAL****** */
      precio_actual = ticker.BTCBUSD;
      precio_ref = precio_actual;    
      precio_venta = Math.trunc(precio_actual * (1 + process.env.PRICE_PERCENT/100));
      precio_compra = Math.trunc(precio_actual * (1 - process.env.PRICE_PERCENT/100));
      //colocarParOrdenes();//Coloco una orden de compra y una de venta para iniciar el Bot
      colocar2ordenes(quantity,precio_compra,precio_venta);
      if(error) console.log("Error de lectura de datos");
    });
}catch(error) {console.log("Error de inicio de Bot",error);}
broadcast();
}

iniciar();

const while_de_prueba = async () => {
  let contador = 1;
  while(contador < 10){
  contador++;
  console.clear();
  console.log("En while principal", contador);
    if (contador == 3){
      sleep_and_await(29000,31000);
    }
    miFuncion();
  await sleep(process.env.SLEEP_TIME)
  }
}



//while_de_prueba();

/********  TODO  ******* */
//Generar funcion broadcast
//Leer precio actual de la variable en Binance
//Guardar el precio como precio de referencia
//Calcular el porcentaje hacia arriba y colocar orden de venta ficticia
//Calcular porcentaje hacia abajo y colocar orden de compra ficticia
//Guardar operacion en un archivo
//Actualizar nuevo precio de referencia
//Colocar try catch en broadcast
//Recortar decimales
//Cuando cree una orden tiene que borrar la orden que sobra
//Hacer funcion de colocacion de pares de ordenes
//Colocar ordenes reales de compra y venta 
//Colocar la variacion de precio por variable
//Calcular profits en procentajes 
//Calcular profits en USD
//Guardar profits en un archivo
//Fabricar Worker que trabaje en segundo plano* Creo que no hace falta
//TODO: Subir Bot online con html.css y codigo.js con boton de encendido y apagado* 
//TODO: Emprolijar gestion de archivos
//TODO: Controlar balances de cuenta para evitar errores*
//TODO: Revisar estados de ordenes segun ID
//TODO: Revisar historial de ordenes de Binance
//TODO: Funcion Refresh (Actualiza todos los datos de ordenes abiertas y cerradas)
//TODO: Funcion inicialize: Pone una orden de compra por debajo y un de venta por encima y muetra la pantalla inicial
//TODO: Enviar Post de tradingview a la app
//TODO: Realizar backtesting de estrategias en tradingview
//TODO: Poner Bot con front end de prueba grid negro
//TODO: Subir Bot a Heroku
//TODO: Calcular velocidad de movimiento
//TODO: Bot alcista/bajista con distancia entre compra y venta o bien doble compra alcista y doble venta en bajista.
//TODO: Separa profites diariamente y calcular poorcentaje diario




/******** Cancelar todas las ordenes  ************* */
// console.info( await binance.cancelAll("BTCBUSD") );

/***********  Orden limite con callback  **************** */
/*
let quantity = 0.001, price = 18000;
binance.buy("BTCBUSD", quantity, price, {type:'LIMIT'}, (error, response) => {
  console.log("\n========== Ordenes de compra/venta con callback ===========")
  console.info("Limit Buy response", response);
  console.info("order id: " + response.orderId);
});*/

//TAMBIEN SE PUEDE BORRAR LA ULTIMA ORDEN QUE QUEDA EN EL ARRAY: POSICION[2].id
//CREAR CADA ORDEN CON CALLBACK Y GRBAR ID EN VARIABLES SEPARADAS. LUEGO DE BORRAR LA ORDEN SOBREESCRIBIR VARIABLE

//Funcion para cancelar todas las ordenes
 // binance.cancelOrders("BTCBUSD",error =>{
          //   console.log(error);
          // });

 // binance.cancelAll("BTCBUSD");

 //Funciones de compra y venta limit en spot sin callback
  //binance.buy("BTCBUSD", quantity, precio_compra);
  //binance.sell("BTCBUSD", quantity, precio_venta);// Venta


/*
//Para obtener los balances de coins especificas
binance.balance((error, balances) => {
  if ( error ) return console.error(error);
  //console.info("balances()", balances);
  console.log("\n========== Balances ===========")
  console.info("BTC balance: ", balances.BTC.available);
  console.info("ETH balance: ", balances.ETH.available);
  console.info("USDT balance: ", balances.USDT.available);
  console.info("BUSD balance: ", balances.BUSD.available);
});
*/
