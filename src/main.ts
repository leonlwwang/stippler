import './global.css'
import { ACTIVE, PASSIVE } from './cache'

const ANIMATION_TIME: number = 2;

/**
 * Renders the idle, passive stippling path.
 */
function idle(): void {
    const css = document.createElement('style');
    const script = '\
                    svg path {\
                        d:path("' + PASSIVE + '");\
                        animation: fade-in 1s;\
                    }\
                    @keyframes fade-in {\
                        0% {\
                            opacity: 0;\
                        }\
                        100% {\
                            opacity: 1;\
                        }\
                    }';
    css.innerHTML = script;

    const pathElement = document.getElementById('stippling-passive') as HTMLElement;
    pathElement.appendChild(css);
}

/**
 * Animates the stippling.
 */
function animate(): HTMLStyleElement {
    // Append CSS animation script to the path
    const css = document.createElement('style');
    const script = '\
                      svg path {\
                          d:path("' + ACTIVE + '");\
                          animation: morph ' + ANIMATION_TIME + 's;\
                      }\
                      \
                      @keyframes morph {\
                          0% {\
                              d:path("' + PASSIVE + '");\
                          }\
                          100% {\
                              d:path("' + ACTIVE + '");\
                          }\
                      }';
    css.innerHTML = script;
    return css;
}

const animation = animate();
idle();
setTimeout(() => {
    const pathElement = document.getElementById('stippling-passive') as HTMLElement;
    pathElement.appendChild(animation);
}, 1000);
