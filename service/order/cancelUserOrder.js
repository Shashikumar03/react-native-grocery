import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const cancelUserOrder = async (orderId) => {

    try{
        const url = `${getBaseUrl()}/api/place-order/cancel/${orderId}?reason=lost`;
        const response = await axios.post(url); 
        console.log("order id which will cancel",orderId)
        console.log("cancel order response ",response.data)

        return {
            success: true,
            data: response.data,
            status: response.status,
        };

    }catch(error){
        const errorData = error.response ? error.response.data : { message: "Network error" };
        const errorStatus = error.response ? error.response.status : 500;

        return {
            success: false,
            data: errorData,
            status: errorStatus,
        };

    }



}