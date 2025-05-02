
import axios from "axios";
import { getBaseUrl } from "../../constants/Baseurl";

export const updatePayment = async (razorpayId,paymentStatus,paymentId) => {

    try{
        const url = `${getBaseUrl()}/payment/${razorpayId}/${paymentStatus}/${paymentId}`;
        const response = await axios.put(url); 
        console.log("update payment", response.data)
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