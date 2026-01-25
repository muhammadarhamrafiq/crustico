export class ApiResponse {
    status: number
    success: boolean
    message: string
    data?: string | object

    constructor(status: number, message: string, data?: string | object) {
        this.status = status
        this.success = status >= 200 && status < 300
        this.message = message
        if (data) {
            this.data = data
        }
    }
}
