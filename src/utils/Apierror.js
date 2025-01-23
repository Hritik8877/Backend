class Apierror extends Error {
  constructor(
    statuscode,
    message="Something went wrong",
    error=[],
    stack=""
  ) {
    super(message)
    this.statuscode = statuscode
    this.error = error
    this.stack = stack
    this.data=null

    if(stack){
        this.stack=stack
    }else{
        Error.captureStackTrace(this,this.constructor)
    }
  }
}
export default Apierror