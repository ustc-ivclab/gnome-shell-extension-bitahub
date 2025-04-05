/// <reference types="@girs/gtk-4.0/ambient" />
/// <reference types="@girs/gnome-shell/extensions/extension/ambient" />
/// <reference types="@girs/gnome-shell/ui/panelMenu/ambient" />
/// <reference types="@girs/gnome-shell/ui/popupMenu/ambient" />
/// <reference types="@girs/gnome-shell/ui/main/ambient" />

import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import St from "gi://St";
import Soup from "gi://Soup";
import {fromXML} from "./node_modules/from-xml/dist/from-xml.mjs";

import {Extension, gettext as _} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";

const number_gpu_max = 8;
const url = "https://bitahub.ustc.edu.cn/resources/";
class Section extends St.BoxLayout {
    static {
        GObject.registerClass(this);
    }
    constructor(text, device, session) {
        super({style_class: "section"});
        this.add_child(new St.Label({text: text, style_class: "name"}));
        for (let index = number_gpu_max; index > 0; index--) {
            this.add_child(new St.Label({style_class: "number"}));
        }
        this._updateId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5,
            () => {
                if (this.visible) {
                    const message = Soup.Message.new("GET", url + device);
                    session.send_and_read_async(
                        message,
                        GLib.PRIORITY_DEFAULT,
                        null,
                        (sess, result) => {
                            if (message.status_code === 200) {
                                const numbers = [];
                                for (const tr of fromXML(new TextDecoder().decode(sess.send_and_read_finish(result).get_data())).table.tbody.tr) {
                                    numbers.push(Number(tr.td[1]));
                                }
                                const average = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / (number_gpu_max + 1);
                                for (let index = number_gpu_max; index > 0; index--) {
                                    const number = numbers.filter((x) => x === index).length;
                                    const label = this.get_children()[number_gpu_max + 1 - index];
                                    label.text = "" + number;
                                    if (number === 0) {
                                        label.style_class = "number zero"
                                    } else if (number >= average) {
                                        label.style_class = "number full"
                                    } else
                                        label.style_class = "number unfull"
                                }
                            }
                        }
                    );
                }
                return GLib.SOURCE_CONTINUE;
            });
    }
    destroy() {
        GLib.Source.remove(this._updateId);
        this._updateId = null;
        super.destroy();
    }
}

class Indicator extends PanelMenu.Button {
    static {
        GObject.registerClass(this);
    }
    _init(metadata, settings, session) {
        super._init(0, _(metadata.name));
        this._session = session;

        this.add_child(new St.Icon({
            gicon: new Gio.FileIcon({file: metadata.dir.resolve_relative_path("assets/images/48.png")}),
            style_class: "icon"
        }));

        const box = new St.BoxLayout({style_class: "section"});
        box.add_child(new St.Label({text: "GPU", style_class: "name"}))
        for (let index = number_gpu_max; index > 0; index--) {
            box.add_child(new St.Label({text: "" + index, style_class: "number"}))
        }
        const item = new PopupMenu.PopupBaseMenuItem({reactive: false});
        item.add_child(box);
        this.menu.addMenuItem(item);

        this._sections = [];
        const item1 = new PopupMenu.PopupBaseMenuItem({reactive: false});
        const section1 = new Section("1080ti", "gtx1080ti", session);
        item1.add_child(section1);
        this._sections.push(section1);
        settings.bind("gtx1080ti", item1, "visible", Gio.SettingsBindFlags.GET);
        this.menu.addMenuItem(item1);

        const item2 = new PopupMenu.PopupBaseMenuItem({reactive: false});
        const section2 = new Section("3090", "rtx3090", session);
        item2.add_child(section2);
        this._sections.push(section2);
        settings.bind("rtx3090", item2, "visible", Gio.SettingsBindFlags.GET);
        this.menu.addMenuItem(item2);

        const item3 = new PopupMenu.PopupBaseMenuItem({reactive: false});
        const section3 = new Section("v100", "teslav100", session);
        item3.add_child(section3);
        this._sections.push(section3);
        item3.add_child(section3);
        settings.bind("teslav100", item3, "visible", Gio.SettingsBindFlags.GET);
        this.menu.addMenuItem(item3);

        const item4 = new PopupMenu.PopupBaseMenuItem({reactive: false});
        const section4 = new Section("a40", "teslaa40_L", session);
        item4.add_child(section4);
        this._sections.push(section4);
        item4.add_child(section4);
        settings.bind("teslaa40", item4, "visible", Gio.SettingsBindFlags.GET);
        this.menu.addMenuItem(item4);

        const item5 = new PopupMenu.PopupBaseMenuItem({reactive: false});
        const section5 = new Section("debug", "debug", session);
        item5.add_child(section5);
        this._sections.push(section5);
        item5.add_child(section5);
        settings.bind("debug", item5, "visible", Gio.SettingsBindFlags.GET);
        this.menu.addMenuItem(item5);
    }
    destroy() {
        this._session.destroy();
        this._session = null;
        for (const section of this._sections) {
            section.destroy();
        }
        super.destroy();
    }
};

export default class BitahubExtension extends Extension {
    enable() {
        this._indicator = new Indicator(this.metadata, this.getSettings(), new Soup.Session());
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
