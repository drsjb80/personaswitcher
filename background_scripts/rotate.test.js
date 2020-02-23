describe ('rotate function', () => {

    const rotate = require('./rotate');

    test ("test rotate function", () => {
        rotate.autoRotate();
        expect(rotate).toHaveBeenCalled();
    });

    test ("test rotate on startup function", () => {
        rotateOnStartup();
        expect(rotate).toHaveBeenCalled();
    });

    test ("test start rotate alarm function", () => {
        startRotateAlarm();
        expect(Promise.resolve());
    });

});