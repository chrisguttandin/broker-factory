import { IWorkerDefinition } from 'worker-factory';
import { IBrokerDefinition, IDefaultBrokerDefinition } from '../interfaces';
import { TBrokerImplementation } from '../types';

export const extendBrokerImplementation = <T extends IBrokerDefinition, U extends IWorkerDefinition>(
    partialBrokerImplementation: TBrokerImplementation<T, U>
): TBrokerImplementation<T & IDefaultBrokerDefinition, U> => {
    // @todo The spread operator can't be used here because TypeScript does not believe that partialBrokerImplementation is an object.
    return Object.assign({ }, partialBrokerImplementation, <TBrokerImplementation<IDefaultBrokerDefinition, U>> {
        connect: ({ call }) => {
            return async (): Promise<MessagePort> => {
                const { port1, port2 } = new MessageChannel();

                await call('connect', { port: port1 }, [ port1 ]);

                return port2;
            };
        },
        disconnect: ({ call }) => {
            return async (port: MessagePort): Promise<void> => {
                await call('disconnect', { port }, [ port ]);
            };
        }
    });
};
