/*
    Event throttle using requestAnimationFrame
    Author: Mike Simmonds - https://gist.github.com/simmo/34a18a0b98547c16c071
*/

function throttle(type, name, obj = window) {
    let running = false

    let func = () => {
        if (running) {
            return
        }

        running = true

        requestAnimationFrame(() => {
            obj.dispatchEvent(new CustomEvent(name))
            running = false
        })
    }

    obj.addEventListener(type, func)
}

export default throttle
