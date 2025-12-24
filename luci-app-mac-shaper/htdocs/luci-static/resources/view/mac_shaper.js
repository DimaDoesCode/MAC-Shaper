'use strict';

'require view';
'require form';
'require uci';
'require ui';
'require rpc';

/*
 * --------------------------------------------------------------------
 * MAC ADDRESS VALIDATION
 * --------------------------------------------------------------------
 */
function validateMAC(value) {
    return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(value);
}

/*
 * --------------------------------------------------------------------
 * MAIN VIEW
 * --------------------------------------------------------------------
 */
return view.extend({

    /*
     * Call /etc/init.d/<service> <action>
     */
    callService: rpc.declare({
        object: 'luci',
        method: 'setInitAction',
        params: ['name', 'action']
    }),

    /*
     * mac-shaper status via ubus
     */
    callUBusMacShaperStatus: rpc.declare({
        object: 'luci.mac-shaper',
        method: 'status',
        params: []
    }),

    load: function () {
        return Promise.resolve();
    },

    /*
     * ----------------------------------------------------------------
     * UI RENDERING
     * ----------------------------------------------------------------
     */
    render: function () {

        const serviceName = 'mac-shaper';

        // Status indicators
        let statusIndicator = E('div', {
            style: 'margin:10px 0;font-family:monospace;font-weight:bold;font-size:0.85rem;'
        }, _('Status: checking...'));

        let configIndicator = E('div', {
            style: 'margin:10px 0;font-family:monospace;font-size:0.85rem;'
        }, _('Loading configuration...'));

        // Service control buttons
        let buttonContainer = E('div', { class: 'cbi-page-actions' }, [
            E('button', {
                class: 'cbi-button cbi-button-action',
                click: ui.createHandlerFn(this, 'handleServiceAction',
                    serviceName, 'start', statusIndicator)
            }, _('Start')),

            E('button', {
                class: 'cbi-button cbi-button-negative',
                click: ui.createHandlerFn(this, 'handleServiceAction',
                    serviceName, 'stop', statusIndicator)
            }, _('Stop')),

            E('button', {
                class: 'cbi-button cbi-button-action',
                click: ui.createHandlerFn(this, 'handleServiceAction',
                    serviceName, 'restart', statusIndicator)
            }, _('Restart')),

            E('button', {
                class: 'cbi-button cbi-button-action',
                click: ui.createHandlerFn(this, 'handleServiceAction',
                    serviceName, 'reload', statusIndicator)
            }, _('Reload')),
        ]);

        let fullDescription = E('div', [
            E('p', _('Easily control how much bandwidth each device on your network can use.'
                + ' The <abbr title="A unique hardware address that identifies a network'
                + ' device" style="text-decoration: underline;">MAC</abbr> Shaper uses advanced'
                + ' <abbr title="A package providing the complete traffic control utility'
                + ' device" style="text-decoration: underline;">tc</abbr> traffic shaping to'
                + ' ensure fair access. Set hard limits for guest devices, or guarantee minimum'
                + ' speeds for critical clients (like a work PC or gaming console),'
                + ' preventing one device from slowing down the entire home network.')),
            E('h3', _('Service Control')),
            statusIndicator,
            configIndicator,
            buttonContainer
        ]);

        let m = new form.Map('mac-shaper', _('MAC Shaper'), fullDescription);

        /*
         * BASIC SETTINGS
         */
        let s = m.section(form.TypedSection, 'mac-shaper', _('Basic Settings'));
        s.anonymous = true;
        s.addremove = false;

        let bw = s.option(form.Value, 'default_bw', _('<span title="Total internet capacity,'
            + ' typically 90-95% of ISP speed">Default bandwidth</span>'), _('Example: 100mbit, 500kbit'));
        bw.datatype = 'string';

        let burst = s.option(form.Value, 'burst', _('<span title="Buffer size (in bytes)'
            + ' for temporarily exceeding the guaranteed rate">Burst</span>'), _('Example: 15k or \'auto\''));
        burst.datatype = 'string';
        burst.placeholder = 'auto';

        let cburst = s.option(form.Value, 'cburst', _('<span title="Defines the buffer size (in bytes)'
            + ' for the maximum ceil speed">CBurst</span>'), _('Example: 15k or \'auto\''));
        cburst.datatype = 'string';
        cburst.placeholder = 'auto';

        /*
         * PER CLIENT LIMITS
         */
        let r = m.section(form.GridSection, 'rule', _('Per-client limits'));
        r.anonymous = true;
        r.addremove = true;
        r.sortable = true;
        r.nodescriptions = true;
        r.addbtntitle = _('Add new client');

        // Inline enable checkbox
        let enable = r.option(form.Flag, 'enabled', _('Enable'));
        enable.default = '1';
        enable.rmempty = false;
        enable.modalonly = false;
        enable.editable  = true;

        // MAC address
        let mac = r.option(form.Value, 'mac', _('MAC address'));
        mac.rmempty = false;
        mac.validate = function (sid, val) {
            if (!validateMAC(val))
                return _('Invalid MAC format, must be XX:XX:XX:XX:XX:XX');
            return true;
        };

        // Rate
        let rate = r.option(form.Value, 'rate', _('Rate'));
        rate.placeholder = '100mbit';

        // Comment
        r.option(form.Value, 'comment', _('Comment'));

        // Initial render updates
        let renderPromise = m.render();

        renderPromise.then(() => {
            this.updateStatus(statusIndicator).catch(() => {});
            this.updateConfigInfo(configIndicator);
        });

        return renderPromise;
    },

    /*
     * ----------------------------------------------------------------
     * CONFIG INFO
     * ----------------------------------------------------------------
     */
    updateConfigInfo: function (el) {

        const device = uci.get_first('mac-shaper', 'mac-shaper', 'device') || '—';
        const bw     = uci.get_first('mac-shaper', 'mac-shaper', 'default_bw') || '—';
        const burst = uci.get_first('mac-shaper', 'mac-shaper', 'burst') || '—';
        const cburst= uci.get_first('mac-shaper', 'mac-shaper', 'cburst') || '—';

        let rulesCount   = 0;
        let enabledCount = 0;

        uci.sections('mac-shaper', 'rule', s => {
            rulesCount++;
            if (uci.get('mac-shaper', s['.name'], 'enabled') === '1')
                enabledCount++;
        });

        el.textContent =
            `Device: ${device} | Rules: ${rulesCount} (enabled: ${enabledCount}) | `
            + `Default: ${bw} | Burst: ${burst} | CBurst: ${cburst}`;
    },

    /*
     * ----------------------------------------------------------------
     * STATUS
     * ----------------------------------------------------------------
     */
    updateStatus: function (el) {
        return this.callUBusMacShaperStatus()
            .then(r => {
                const active = !!(r && (r.active === 1 || r.active === true || r.active === "1"));

                if (active) {
                    el.textContent = _('Status: ACTIVE');
                    el.style.color = 'green';
                } else {
                    el.textContent = _('Status: INACTIVE');
                    el.style.color = '#888';
                }
                return active;
            })
            .catch(e => {
                console.error('mac-shaper status error:', e);
                el.textContent = _('Status: ERROR');
                el.style.color = 'red';
                throw e;
            });
    },

    /*
     * ----------------------------------------------------------------
     * WAIT FOR SERVICE STATE
     * ----------------------------------------------------------------
     */
    waitForState: function (el, expectedState, timeoutMs = 4000) {

        const startTime = Date.now();

        const poll = () => {
            return this.updateStatus(el).then(actual => {

                if (actual === expectedState)
                    return true;

                if (Date.now() - startTime > timeoutMs)
                    throw new Error('Timeout waiting for mac-shaper');

                return new Promise(r => setTimeout(r, 300)).then(poll);
            });
        };

        return poll();
    },

    /*
     * ----------------------------------------------------------------
     * SERVICE CONTROL HANDLER
     * ----------------------------------------------------------------
     */
    handleServiceAction: function (serviceName, actionName, statusEl) {

        statusEl.textContent = _('Status: APPLYING...');
        statusEl.style.color = '#09c';

        const expectedState = (actionName !== 'stop');

        return this.callService(serviceName, actionName)
            .then(() => this.waitForState(statusEl, expectedState))
            .catch(e => {

                console.error('RPC error:', e);

                statusEl.textContent = _('Status: ERROR');
                statusEl.style.color = 'red';

                ui.addNotification(
                    null,
                    E('p', _('RPC error: ') + (e.message || e.toString()))
                );
            });
    }
});
