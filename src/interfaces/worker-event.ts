import { IWorkerMessage } from 'worker-factory';

export interface IWorkerEvent extends Event {

    data: IWorkerMessage;

}
