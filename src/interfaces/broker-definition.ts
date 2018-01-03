import { TValue } from 'worker-factory';

export interface IBrokerDefinition {

    [ method: string ]: (params: TValue) => void | Promise<void> | Promise<TValue>;

}
