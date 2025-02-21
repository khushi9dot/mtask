class apiError extends Error{
    constructor(status,message,data)
    {
        super(message);
        this.status=status,
        this.message=message,
        this.data=data
    }

    static unAuthorized(status=401,message="unauthorized access",data){
        return new apiError(status,message,data)
    }

    static notFound(status=404,message="not found",data){
        return new apiError(status,message,data)
    }

    static badRequest(status=400,message="bad request",data){
        return new apiError(status,message,data)
    }

    static serverError(status=500,message="internal server error",data){
        return new apiError(status,message,data)
    }

}

export{apiError}