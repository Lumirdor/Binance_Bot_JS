const fs = require ('fs');

class Archivos {

    historial = [];
    arrayObjetos = [];
    dbPath = './db/data.json';

    constructor(){
        this.leerDB();//lee DB si existe
    }

    agregarHistorial (elemento =''){
        //if (this.historial.includes(lugar.toLowerCase())) return;
        //this.historial = this.historial.splice(0,4);
        //this.historial.unshift(elemento);
        this.historial = elemento;
    }   

    guardarDB(){
        const payload = {
            trade: this.historial
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){
        // Verifica que exista, si no existe no hacer nada
        if (!fs.existsSync(this.dbPath)) return;
        // Si existe
        const info = fs.readFileSync(this.dbPath,{encoding:'utf-8'});
        const data = JSON.parse(info);
        this.historial = data.trade;
        return data.trade;
    }

    leerDBgain(db){
        if (!fs.existsSync(db)) return;// Verifica que exista, si no existe no hacer nada
        const info = fs.readFileSync(db,{encoding:'utf-8'});// Si existe leo y guardo en info
        const data = JSON.parse(info);
        this.arrayObjetos = data;
    }

    guardarObjeto(direccion, objeto){
        this.arrayObjetos.unshift(objeto);
        fs.writeFileSync(direccion, JSON.stringify(this.arrayObjetos));
    }
}

module.exports = Archivos;