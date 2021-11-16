import {PolymerElement, html} from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import '@vaadin/vaadin-icons/vaadin-icons';

class SlideTab extends ThemableMixin(PolymerElement) {
    static get is() {
        return 'slide-tab'
    }

    static get template() {
        return html`
        <style>
            :host {
                --slide-tab-background-color: var(--lumo-primary-color, blue);
                --slide-tab-color: white;

                display: flex;
                align-items: center;
                box-sizing: border-box;
                position: absolute;
                color: var(--slide-tab-color);
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }
            :host(.bottom) {
                flex-flow: column;
                top: auto;
            }
            :host(.top) {
                flex-flow: column-reverse;
                bottom: auto;
            }
            :host(.left) {
                flex-flow: row-reverse;
                right: auto;
            }
            :host(.right) {
                flex-flow: row;
                left: auto;
            }

            :host(.left) #content, :host(.right) #content {
                width: 0;
            }
            :host(.top) #content, :host(.bottom) #content {
                height: 0;
            }

            :host(.left) #tab {
                border-radius: 0 0 var(--lumo-border-radius) var(--lumo-border-radius);
                transform-origin: 0 50%;
                transform: rotate(-90deg) translate(-50%, 50%);
                left: 100%;
            }
            :host(.right) #tab {
                border-radius: var(--lumo-border-radius) var(--lumo-border-radius) 0 0;
                transform-origin: 100% 50%;
                transform: rotate(-90deg) translate(50%, -50%);
                right: 100%;
            }
            :host(.top) #tab {
                border-radius: 0 0 var(--lumo-border-radius) var(--lumo-border-radius);
                top: 100%;
            }
            :host(.bottom) #tab {
                border-radius: var(--lumo-border-radius) var(--lumo-border-radius) 0 0;
                bottom: 100%;
            }

            /* Styles for tab positioning BEGINNING */
            :host(.beginning.left) #tab {
                transform-origin: 0 100%;
                transform: rotate(-90deg) translate(0, 100%);
                bottom: 0;
            }
            :host(.beginning.right) #tab {
                transform-origin: 100% 100%;
                transform: rotate(-90deg) translate(100%, 0);
                bottom: 0;
            }
            :host(.beginning.top) #tab, :host(.beginning.bottom) #tab {
                left: 0;
            }
            /* Styles for tab positioning END */
            :host(.end.left) #tab {
                transform-origin: 0 0;
                transform: rotate(-90deg) translate(-100%, 0%);
                top: 0;
            }
            :host(.end.right) #tab {
                transform-origin: 100% 0;
                transform: rotate(-90deg) translate(0, -100%);
                top: 0;
            }
            :host(.end.top) #tab, :host(.end.bottom) #tab {
                right: 0;
            }

            #tab {
                position: absolute;
                display: flex;
                align-items: center;
                min-width: 120px;
                background-color: var(--slide-tab-background-color);
                white-space: nowrap;
                padding: var(--lumo-space-xs) var(--lumo-space-m);
            }
            #content {
                background-color: var(--slide-tab-background-color);
                align-self: stretch;
                position: relative;
                overflow: hidden;
            }
            #content ::slotted(*) {
                display: inline-block;
                padding: var(--lumo-space-m);
            }
            #tab::after, :host::after {
                content: "";
                position: absolute;
                top: 0; left: 0; bottom: 0; right: 0;
                z-index: -1;
                box-shadow: var(--lumo-box-shadow-m);
            }

            #expand, #collapse {
                padding-left: 1em;
                margin-left: auto;
            }
            #collapse, :host(.expanded) #expand {
                display: none;
            }
            :host(.expanded) #collapse, #expand {
                display: inline-block;
            }
        </style>

        <div part="tab" id="tab" on-click="toggle">
            [[caption]]
            <div id="expand">
                <slot name="expand">
                    <iron-icon icon="vaadin:vaadin:plus-circle"></iron-icon>
                </slot>
            </div>
            
            <div id="collapse">
                <slot name="collapse">
                    <iron-icon icon="vaadin:vaadin:minus-circle"></iron-icon>       
                </slot>
            </div>
        </div>
        <div part="content" id="content">
            <slot></slot>
        </div>`;
    }

    constructor() {
        super();
        this.outsideClickListener = this._onOutsideClick.bind(this);
    }

    expand(size, vertical) {
        let content = this.$.content;
        // Calculate the size if size is negative or zero
        if (size <= 0) {
            size = vertical ? content.scrollHeight : content.scrollWidth;
            size = Math.min(size, this._getMaxSize(vertical));
        }
        if (vertical) {
            content.style.height = size + "px";
        } else {
            content.style.width = size + "px";
        }

        this.classList.toggle("expanded", true);
        document.body.addEventListener("click", this.outsideClickListener);
    }

    collapse(vertical) {
        if (vertical) {
            this.$.content.style.height = "0";
        } else {
            this.$.content.style.width = "0";
        }

        this.classList.toggle("expanded", false);
        document.body.removeEventListener("click", this.outsideClickListener);
    }

    _onOutsideClick(event) {
    	this.$server.isClosingOnOutsideClick().then(result => {
    		if (result && !this._isChildElement(event.target)) {
    			this.$server.onOutsideClicked();
    		}
    	});
    }

    _isChildElement(element) {
        while (element != null) {
            if (element == this) {
                return true;
            }
            element = element.parentNode;
        }
        return false;
    }

    /**
     * Returns the maximum size that the slide content can take, which is the width/height of the
     * body element minus the size of the tab.
     *
     * @param vertical      True if the slide opens in a vertical direction
     * @returns {number}    The maximum size
     * @private
     */
    _getMaxSize(vertical) {
        // Use the offsetHeight of the tab for both cases, as it's rotated for horizontal slides
        return vertical ? document.body.scrollHeight - this.$.tab.offsetHeight :
            document.body.scrollWidth - this.$.tab.offsetHeight;
    }


    connectedCallback() {
        super.connectedCallback();
        if (this.classList.contains("expanded")) {
            document.body.addEventListener("click", this.outsideClickListener);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.body.removeEventListener("click", this.outsideClickListener);
    }
}

customElements.define(SlideTab.is, SlideTab);
