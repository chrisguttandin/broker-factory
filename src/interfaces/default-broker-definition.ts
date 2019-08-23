import { IBrokerDefinition } from './broker-definition';

export interface IDefaultBrokerDefinition extends IBrokerDefinition {

    connect (): Promise<MessagePort>;

    disconnect (port: MessagePort): Promise<void>; // tslint:disable-line:invalid-void

    isSupported (): Promise<boolean>;

}
