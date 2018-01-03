export interface IBrokerDefinition {

    [ method: string ]: (...args: any[]) => void | Promise<any>;

}
