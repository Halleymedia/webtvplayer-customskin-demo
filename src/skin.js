//Custom skin
WebTvPlayer.MyCustomSkin = function() {

    //Just expose the render and (optionally) the destroy methods
    Object.defineProperty(this, 'render', { writable: false, configurable: false, value: render });
    Object.defineProperty(this, 'destroy', { writable: false, configurable: false, value: destroy });

    async function render() {
        console.log("Render has been invoked");
        const player = this; //this is a WebTvPlayer, documented here: https://api.civicam.it/v1/embed/#custom-skins
        //this might change in the future as it might be best to pass the player instance as an argument to the render method

        const templateContent = await loadTemplateContent('./skin.html');

        //Populate the HTML container element
        const rootElement = document.importNode(templateContent, true);
        player.container.appendChild(rootElement);
        
        //Handle events
        player.container.addEventListener('click', handleEvent.bind(player, 'click'), false);
        player.on('position', reportPosition);
        player.on('stop', reportPosition);
        player.on('buffer', reportBuffer);
    };

    function destroy() {
        const player = this;
        console.log("destroy has been invoked");
        //Any cleanup here
        player.container.innerHTML = '';
        //No need to explicitly unsubscribe events: the player object is going to be destroyed anyway.        
    }

    async function loadTemplateContent(path) {
        const response = await fetch(path);
        const text = await response.text();
        const template = new DOMParser().parseFromString(text, 'text/html').querySelector('template');
        return template.content;
    }

    function handleEvent(eventName, event) {
        const player = this;
        const actionName = event.target.dataset.action;
        if (!actionName || !eventName) {
            return;
        }
        if (eventName == 'click') {
            switch(actionName) {
                case 'pause':
                    player.pause();
                    break;
                case 'play':
                    player.play();
                    break;
                case 'stop':
                    player.stop();
                    break;
                default:
                    console.log(`Action ${actionName} not supported`);
                    break;
            }
        }
    }

    function reportPosition(position) {
        this.container.querySelector("[data-output=position]").innerText = `${(position || 0).toFixed(1)}s`;
    }

    function reportBuffer(empty, percent) {
        this.container.querySelector("[data-output=buffer]").innerText = `${(percent || 0).toFixed(1)}% ${empty?' (buffering)' : ''}`;
    }
};