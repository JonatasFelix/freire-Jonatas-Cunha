import { PurchaseAllInfo } from "./Purchase";

export type User = {
    name: string,
    email: string,
    password: string
};

export type UserData = {
    id: string,
    name: string,
    email: string,
    purchases: PurchaseAllInfo[]
};