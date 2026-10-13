from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

class BusinessLogicException(Exception):
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code

async def business_exception_handler(request: Request, exc: BusinessLogicException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail}
    )