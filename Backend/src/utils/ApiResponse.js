class ApiResponse {
    constructor(success,message,data=null,statusCode){
        this.success=statusCode<400;
        this.message=message;
        this.data=data;
        this.statusCode=statusCode;
    }
}
export default ApiResponse;