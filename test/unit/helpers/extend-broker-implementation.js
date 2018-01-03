import { extendBrokerImplementation } from '../../../src/helpers/extend-broker-implementation';

describe('extendBrokerImplementation', () => {

    after((done) => {
        // @todo This is a optimistic fix to prevent the famous 'Some of your tests did a full page reload!' error.
        setTimeout(done, 1000);
    });

    describe('without any additional implementation', () => {

        it('should return the default implementation', () => {
            const fullBrokerImplementation = extendBrokerImplementation({ });

            expect(fullBrokerImplementation).to.have.keys([ 'connect', 'disconnect' ]);
        });

    });

    describe('with an additional implementation', () => {

        it('should return the extended implementation', () => {
            const fullBrokerImplementation = extendBrokerImplementation({ subtract: () => {} });

            expect(fullBrokerImplementation).to.have.keys([ 'connect', 'disconnect', 'subtract' ]);
        });

    });

});
