import { createExtendBrokerImplementation } from '../../../src/factories/extend-broker-implementation';

describe('extendBrokerImplementation', () => {
    let extendBrokerImplementation;

    beforeEach(() => {
        extendBrokerImplementation = createExtendBrokerImplementation(new WeakMap());
    });

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
