import { createBrokerFactory } from '../../../src/factories/create-broker';
import { createCreateOrGetOngoingRequests } from '../../../src/factories/create-or-get-ongoing-requests';
import { createExtendBrokerImplementation } from '../../../src/factories/extend-broker-implementation';
import { generateUniqueNumber } from 'fast-unique-numbers';
import { isMessagePort } from '../../../src/guards/message-port';

describe('module', () => {
    describe('with a MessagePort', () => {
        let addMessageEventListener;
        let connect;
        let disconnect;
        let isSupported;
        let portMap;
        let postMessage;

        beforeEach(() => {
            const messageChannel = new MessageChannel();
            const port = messageChannel.port1;

            portMap = new WeakMap();

            ({ connect, disconnect, isSupported } = createBrokerFactory(
                createCreateOrGetOngoingRequests(new WeakMap()),
                createExtendBrokerImplementation(portMap),
                generateUniqueNumber,
                isMessagePort
            )({})(port));

            postMessage = (transformer) => {
                messageChannel.port2.onmessage = ({ data }) => {
                    messageChannel.port2.postMessage(transformer(data));
                };
            };

            addMessageEventListener = (listener) => {
                messageChannel.port2.addEventListener('message', listener);
            };
        });

        describe('connect()', () => {
            beforeEach(() => {
                postMessage(({ id }) => ({ id, result: 123 }));
            });

            it('should send the correct message', function (done) {
                this.timeout(6000);

                addMessageEventListener(({ data }) => {
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

                connect();
            });

            it('should return a MessagePort', function () {
                this.timeout(6000);

                return connect().then((port) => {
                    expect(port).to.be.an.instanceOf(MessagePort);
                });
            });
        });

        describe('disconnect()', () => {
            let port;
            let portId;

            beforeEach(() => {
                const messageChannel = new MessageChannel();

                port = messageChannel.port1;
                portId = 12;

                portMap.set(messageChannel.port1, portId);

                postMessage(({ id }) => ({ id, result: null }));
            });

            it('should send the correct message', function (done) {
                this.timeout(6000);

                addMessageEventListener(({ data }) => {
                    expect(data.id).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: data.id,
                        method: 'disconnect',
                        params: { portId }
                    });

                    done();
                });

                disconnect(port);
            });

            it('should return undefined', async function () {
                this.timeout(6000);

                expect(await disconnect(port)).to.be.undefined;
            });
        });

        describe('isSupported()', () => {
            beforeEach(() => {
                postMessage(({ id }) => ({ id, result: true }));
            });

            it('should send the correct message', function (done) {
                this.timeout(6000);

                addMessageEventListener(({ data }) => {
                    expect(data.id).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: data.id,
                        method: 'isSupported'
                    });

                    done();
                });

                isSupported();
            });

            it('should return true', async function () {
                this.timeout(6000);

                expect(await isSupported()).to.be.true;
            });
        });
    });

    describe('with a Worker', () => {
        let connect;
        let disconnect;
        let isSupported;
        let portMap;

        afterEach(() => {
            Worker.reset();
        });

        beforeEach(() => {
            // eslint-disable-next-line no-global-assign
            Worker = ((OriginalWorker) => {
                const instances = [];

                return class ExtendedWorker extends OriginalWorker {
                    constructor(url) {
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

                    static addEventListener(index, ...args) {
                        return instances[index].addEventListener(index, ...args);
                    }

                    static get instances() {
                        return instances;
                    }

                    static reset() {
                        // eslint-disable-next-line no-global-assign
                        Worker = OriginalWorker;
                    }
                };
            })(Worker);

            const blob = new Blob(
                [
                    `self.addEventListener('message', ({ data }) => {
                    // The port needs to be send as a Transferable because it can't be cloned.
                    if (data.params !== undefined && data.params.port !== undefined) {
                        self.postMessage(data, [ data.params.port ]);
                    } else {
                        self.postMessage(data);
                    }
                });`
                ],
                { type: 'application/javascript' }
            );
            const url = URL.createObjectURL(blob);
            const worker = new Worker(url);

            URL.revokeObjectURL(url);

            portMap = new WeakMap();

            ({ connect, disconnect, isSupported } = createBrokerFactory(
                createCreateOrGetOngoingRequests(new WeakMap()),
                createExtendBrokerImplementation(portMap),
                generateUniqueNumber,
                isMessagePort
            )({})(worker));
        });

        describe('connect()', () => {
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

                connect();
            });
        });

        describe('disconnect()', () => {
            let port;
            let portId;

            beforeEach(() => {
                const messageChannel = new MessageChannel();

                port = messageChannel.port1;
                portId = 12;

                portMap.set(messageChannel.port1, portId);
            });

            it('should send the correct message', function (done) {
                this.timeout(6000);

                Worker.addEventListener(0, 'message', ({ data }) => {
                    expect(data.id).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: data.id,
                        method: 'disconnect',
                        params: { portId }
                    });

                    done();
                });

                disconnect(port);
            });
        });

        describe('isSupported()', () => {
            it('should send the correct message', function (done) {
                this.timeout(6000);

                Worker.addEventListener(0, 'message', ({ data }) => {
                    expect(data.id).to.be.a('number');

                    expect(data).to.deep.equal({
                        id: data.id,
                        method: 'isSupported'
                    });

                    done();
                });

                isSupported();
            });
        });
    });
});
