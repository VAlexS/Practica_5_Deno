export class AuthError extends Error {
    constructor() {
        super("Usuario no esá autenticado")
    }
}