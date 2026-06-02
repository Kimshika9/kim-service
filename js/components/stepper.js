import CONFIG from '../config.js';

class Stepper {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.value = options.initialValue || 0;
        this.min = options.min || 0;
        this.max = options.max || 1000000;
        this.step = options.step || 1000;
        this.onChange = options.onChange || (() => {});
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin: 20px 0;">
                <button id="stepDown" class="iconic-glow" style="width: 45px; height: 45px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); background: white; color: #0F172A; font-size: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    <span style="transform: translateY(-1px);">-</span>
                </button>
                <div style="flex: 1; text-align: center; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px;">
                    <div id="stepValue" style="font-size: 20px; font-weight: 700; color: #05122B;">${this.value.toLocaleString()}</div>
                    <div style="font-size: 10px; color: #64748B; font-weight: 400; margin-top: 2px;">MMK Amount</div>
                </div>
                <button id="stepUp" class="iconic-glow" style="width: 45px; height: 45px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); background: white; color: #0F172A; font-size: 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    <span style="transform: translateY(-1px);">+</span>
                </button>
            </div>
        `;

        this.container.querySelector('#stepDown').onclick = () => {
            this.updateValue(this.value - this.step);
        };
        this.container.querySelector('#stepUp').onclick = () => this.updateValue(this.value + this.step);
    }

    updateValue(newValue) {
        if (newValue >= this.min && newValue <= this.max) {
            this.value = newValue;
            this.container.querySelector('#stepValue').innerText = this.value.toLocaleString();
            this.onChange(this.value);
        }
    }

    getValue() {
        return this.value;
    }

    setValue(val) {
        this.updateValue(val);
    }
}

export default Stepper;
