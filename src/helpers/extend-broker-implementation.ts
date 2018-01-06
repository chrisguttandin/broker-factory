import { IWorkerDefinition } from 'worker-factory';
import { IBrokerDefinition, IDefaultBrokerDefinition } from '../interfaces';
import { TBrokerImplementation } from '../types';
import { PORT_MAP } from './port-map';

export const extendBrokerImplementation = <T extends IBrokerDefinition, U extends IWorkerDefinition>(
    partialBrokerImplementation: TBrokerImplementation<T, U>
): TBrokerImplementation<T & IDefaultBrokerDefinition, U> => {
    // @todo The spread operator can't be used here because TypeScript does not believe that partialBrokerImplementation is an object.
    return Object.assign({ }, partialBrokerImplementation, <TBrokerImplementation<IDefaultBrokerDefinition, U>> {
        connect: ({ call }) => {
            return async (): Promise<MessagePort> => {
                const { port1, port2 } = new MessageChannel();

                const portId = <number> await call('connect', { port: port1 }, [ port1 ]);

                PORT_MAP.set(port2, portId);

                return port2;
            };
        },
        disconnect: ({ call }) => {
            return async (port: MessagePort): Promise<void> => {
                const portId = PORT_MAP.get(port);

                if (portId === undefined) {
                    throw new Error('The given port is not connected.');
                }

                await call('disconnect', { portId });
            };
        }
    });
};
