import messageController from "./controller/messageController.js";
import cartController from "./controller/cartController.js";


import { productsService,usersService,cartsService } from "./repositories/index.js";

const mm = new messageController();


export default io => {
    io.on("connection", async socket => {
        console.log("Nuevo cliente conectado -----> ", socket.id);

        socket.on("sendProduct", async product => {
            try{
                await productsService.createProduct(product);
                const products = await productsService.getAllProducts();
                socket.emit("sendingAllProducts", products);
            } catch (error) {
                socket.emit("statusError", error.message);
            }
        });


        socket.on("deleteProduct", async (data) => {
            try {
                const { pid, userEmail } = data;
                const product = await productsService.getProductByID(pid);
                if (!product) {
                    socket.emit("statusError", "Producto no encontrado");
                    return;
                }
        
                if (userEmail != "admin@gmail.com" && userEmail !== product.owner) {
                    socket.emit("statusError", "No tiene permisos para eliminar este producto");
                    return;
                }
        
                await productsService.deleteProduct(pid);
                const products = await productsService.getAllProducts();
                socket.emit("sendingAllProducts", products);
        
            } catch (error) {
                socket.emit("statusError", error.message);
            }
        });
        
        
        let messages = await mm.getAll();
        if(messages.length > 0){
            io.emit("sendingAllMessages", messages);
        }

        socket.on("send_message", async message => {
            await mm.create(message);
            const messages = await mm.getAll(); // Actualiza la lista de mensajes
            io.emit("sendingAllMessages", messages);
        });
        
        socket.on("addProductToCart", async message => {
            try{
                const user_id = message.uid;
                const product_id = message.pid;

                const product = await productsService.getProductByID(product_id);
                if(!product){
                    socket.emit("statusError", "Producto no encontrado");
                    return;
                }

                const user = await usersService.getUser(user_id);
                if(!user){
                    socket.emit("statusError", "Usuario no encontrado");
                    return;
                }

                if(user.role === "premium" && product.owner === user.email){
                    socket.emit("statusError", "No puedes agregar a tu carrito un producto que te pertenece");
                    return;
                }

                await cartsService.addProductToUsersCart(message.uid,message.pid);
                socket.emit("statusError", "Producto agregado al carrito");
            }catch(error){
                socket.emit("statusError", error.message);
            }
        })

        socket.on("removeProduct", async message => {
            try {
                const cid = message.cid;
                const pid = message.pid;
        
                const cart = await cartsService.getProductsFromCart(cid);
                if (!cart) {
                    socket.emit("statusError", "Carrito no encontrado");
                    return;
                }
        
                const product = await productsService.getProductByID(pid);
                if (!product) {
                    socket.emit("statusError", "Producto no encontrado");
                    return;
                }
        
                await cartsService.deleteProductFromCart(cid, pid);
                socket.emit("productRemoved");
            } catch (error) {
                socket.emit("statusError", error.message);
            }
        });
        

    });
}