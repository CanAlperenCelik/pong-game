import { gameDefaults } from "../views/Game";
import { gamepad } from './types';


export let pressedPads: { gamepadIndex: number, index: number }[] = [];

const padListeners = [] as any[];
const animationFrameIds = {} as any;


export const addGamePadListener = (callbackFunc: any) => {
    let gamepadIndexActive = [] as number[];
    padListeners.push(callbackFunc);
    const index = Math.random() * 1000000;

    async function handle(args?: any) {
        if (gamepadIndexActive.includes(args.gamepadIndex)) return;

        gamepadIndexActive.push(args.gamepadIndex);
        callbackFunc(args)
        await new Promise((resolve) => setTimeout(resolve, gameDefaults.pushInterval));
        gamepadIndexActive = gamepadIndexActive.filter(o => o != args.gamepadIndex);
    }

    const handleGamePadInput = () => {
        const gamepads = navigator.getGamepads();
        if (!gamepads) {
            animationFrameIds[index] = requestAnimationFrame(handleGamePadInput);
            return;
        }

        for (const gamepad of gamepads) {
            if (!gamepad) continue;

            // button presses
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    handle({
                        type: 'button',
                        index: index,
                        pressed: button.pressed,
                        gamepadIndex: gamepad.index
                    });
                }
            });

            // axis movements
            gamepad.axes.forEach((axis, index) => {

                if (axis === 1 || axis === -1) {
                    handle({
                        type: 'pad',
                        index: index,
                        value: axis,
                        gamepadIndex: gamepad.index
                    });

                    if (!pressedPads.find(o => o.gamepadIndex === gamepad.index && o.index === index)) {
                        pressedPads.push({ gamepadIndex: gamepad.index, index: index });
                    }
                    return;
                }



                if (pressedPads.find(o => o.gamepadIndex === gamepad.index && o.index === index)) {
                    callbackFunc({
                        type: 'pad',
                        index: index,
                        value: axis,
                        gamepadIndex: gamepad.index,
                        isRelease: true
                    });

                    pressedPads = pressedPads.filter((pad) => pad.gamepadIndex !== gamepad.index && pad.index !== index);
                }
            });
        }

        animationFrameIds[index] = requestAnimationFrame(handleGamePadInput);
    };

    animationFrameIds[index] = requestAnimationFrame(handleGamePadInput);

    return index;
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return (...args: Parameters<T>): void => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export const removeGamePadListener = (func: any, index: number) => {
    padListeners.splice(padListeners.indexOf(func), 1);
    if (animationFrameIds[index]) {
        cancelAnimationFrame(animationFrameIds[index]);
    }
};

export const isPressReleased = (input: gamepad) => {
    return input.index == 1 && input.isRelease;
}

export const isDownPressed = (input: gamepad) => {
    return input.index == 1 && input.value == -1;
}

export const isUpPressed = (input: gamepad) => {
    return input.index == 1 && input.value == 1;
}

export const isLeftPressed = (input: gamepad) => {
    return input.index == 0 && input.value == -1;
}

export const isRightPressed = (input: gamepad) => {
    return input.index == 0 && input.value == 1;
}
