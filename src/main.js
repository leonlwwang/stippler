import './global.css'
import { ACTIVE, PASSIVE } from './cache'

const ANIMATION_TIME = 1.5;

/**
 * Renders the idle, passive stippling path.
 */
function idle() {
    const css = document.createElement('style');
    const script = '\
                    svg path {\
                        will-change: d, animation;\
                        d:path("' + PASSIVE + '");\
                        animation: fade-in 0.25s;\
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

    const pathElement = document.getElementById('stippling-passive');
    pathElement.appendChild(css);
}

/**
 * Animates the stippling.
 */
function animate() {
    // Append CSS animation script to the path
    const css = document.createElement('style');
    const script = '\
                      svg path {\
                          d:path("' + ACTIVE + '");\
                          animation: morph ' + ANIMATION_TIME + 's cubic-bezier(.7,0,0,1);\
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
    const pathElement = document.getElementById('stippling-passive');
    pathElement.appendChild(animation);
    pathElement.style.willChange = 'auto';
}, 250);
