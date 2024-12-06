import ProductMaterials from "../models/materialModels/productMaterials.model.js";
import ProductMaterialsRequestRecord from "../models/materialModels/productMaterialsRequest.model.js";
import { io } from "./socket.js";


const db_listeners = () => {
    // // ? MATERIALS STORE

    // // ProductMaterials
    // ProductMaterials.watch().on('change', (change) => {
    //     console.log('CHange ProductMaterials');
    //     io.emit('ProductMaterials', change);
    // });

    // // ProductMaterialsRequestRecord
    // ProductMaterialsRequestRecord.watch().on('change', (change) => {
    //     console.log('CHange ProductMaterialsRequestRecord');
    //     io.emit('ProductMaterialsRequestRecord');
    // });

    
}

export default db_listeners;

