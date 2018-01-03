import { createBroker } from '../../src/module';

describe('module', () => {

    let connect;
    let disconnect;

    afterEach(() => {
        Worker.reset();
    });

    beforeEach(() => {
        Worker = ((OriginalWorker) => { // eslint-disable-line no-global-assign
            const instances = [];

            return class ExtendedWorker extends OriginalWorker {

                constructor (url) {
                    super(url);

                    const addEventListener = this.addEventListener;

                    // This is an ugly hack to prevent the broker from handling mirrored events.
                    this.addEventListener = (index, ...args) => {
                        if (typeof index === 'number') {
                            return addEventListener.apply(this, args);
                        }
                    };

                    instances.push(this);
                }

                static addEventListener (index, ...args) {
                    return instances[index].addEventListener(index, ...args);
                }

                static get instances () {
                    return instances;
                }

                static reset () {
                    Worker = OriginalWorker; // eslint-disable-line no-global-assign
                }

            };
        })(Worker);

        const blob = new Blob([
            `self.addEventListener('message', ({ data }) => {
                // The port needs to be send as a Transferable because it can't be cloned.
                if (data.params !== undefined && data.params.port !== undefined) {
                    self.postMessage(data, [ data.params.port ]);
                } else {
                    self.postMessage(data);
                }
            });`
        ], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        ({ connect, disconnect } = createBroker({ })(worker));
    });

    describe('connect()', () => {

        let port;

        beforeEach(() => {
            const messageChannel = new MessageChannel();

            port = messageChannel.port1;
        });

        it('should send the correct message', function (done) {
            this.timeout(6000);

            Worker.addEventListener(0, 'message', ({ data }) => {
                expect(data.id).to.be.a('number');

                expect(data.params.port).to.be.an.instanceOf(MessagePort);

                expect(data).to.deep.equal({
                    id: data.id,
                    method: 'connect',
                    params: {
                        port: data.params.port
                    }
                });

                done();
            });

            connect(port);
        });

    });

    describe('disconnect()', () => {

        let port;

        beforeEach(() => {
            const messageChannel = new MessageChannel();

            port = messageChannel.port1;
        });

        it('should send the correct message', function (done) {
            this.timeout(6000);

            Worker.addEventListener(0, 'message', ({ data }) => {
                expect(data.id).to.be.a('number');

                expect(data.params.port).to.be.an.instanceOf(MessagePort);

                expect(data).to.deep.equal({
                    id: data.id,
                    method: 'disconnect',
                    params: {
                        port: data.params.port
                    }
                });

                done();
            });

            disconnect(port);
        });

    });

});
