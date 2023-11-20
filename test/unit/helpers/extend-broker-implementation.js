import { extendBrokerImplementation } from '../../../src/helpers/extend-broker-implementation';

describe('extendBrokerImplementation', () => {
    describe('without any additional implementation', () => {
        it('should return the default implementation', () => {
            const fullBrokerImplementation = extendBrokerImplementation({});

            expect(fullBrokerImplementation).to.have.keys(['connect', 'disconnect', 'isSupported']);
        });
    });

    describe('with an additional implementation', () => {
        it('should return the extended implementation', () => {
            const fullBrokerImplementation = extendBrokerImplementation({ subtract: () => {} });

            expect(fullBrokerImplementation).to.have.keys(['connect', 'disconnect', 'isSupported', 'subtract']);
        });
    });
});
