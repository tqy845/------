"use strict";
(function () {
    "use strict";
    class AGRequest {
        static request;
        constructor() { }
        static getInstance() {
            if (!AGRequest.request)
                AGRequest.request = new AGRequest();
            return AGRequest.request;
        }
        request(url, params, ...args) {
            throw new Error("Method not implemented.");
        }
    }
    class AGStorage {
        static storage;
        constructor() { }
        static getInstance() {
            if (!AGStorage.storage)
                AGStorage.storage = new AGStorage();
            return AGStorage.storage;
        }
        set(key, value, type = "local") {
            key = "AG_STORAGE_".concat(key.toUpperCase());
            if (value instanceof Object)
                value = JSON.stringify(value);
            type === "local"
                ? localStorage.setItem(key, String(value))
                : sessionStorage.setItem(key, String(value));
        }
        get(key, type = "local", parse = false) {
            key = "AG_STORAGE_".concat(key.toUpperCase());
            let result = type === "local"
                ? localStorage.getItem(key)
                : sessionStorage.getItem(key);
            return parse && result ? JSON.parse(result) : result;
        }
        increase(key, type) {
            const ITEM = this.get(key);
            const VALUE = Number(ITEM);
            if (isNaN(VALUE))
                throw new Error("error:非数字不可自增");
            this.set(key, VALUE + 1, type);
            return Number(this.get(key));
        }
        remove(key, type) {
            key = "AG_STORAGE_".concat(key.toUpperCase());
            type === "local"
                ? localStorage.removeItem(key)
                : sessionStorage.removeItem(key);
        }
        clear() {
            const handler = (instance) => {
                Object.keys(instance).forEach((item) => {
                    if (item.startsWith("AG_STORAGE_")) {
                        instance.removeItem(item);
                    }
                });
            };
            handler(localStorage);
            handler(sessionStorage);
        }
    }
    class AAGElement {
    }
    class AGElement extends AAGElement {
        element;
        constructor(tagName, tagClass, tagId) {
            super();
            this.element = document.createElement(tagName);
            if (tagClass)
                this.element.setAttribute("class", tagClass);
            if (tagId)
                this.element.setAttribute("class", tagId);
        }
        toHTMLElement() {
            return this.element;
        }
        setAttr(key, value) {
            this.element.setAttribute(key, String(value));
        }
        setStyle(attributes, important) {
            const keys = Object.keys(attributes);
            if (!keys.length)
                return false;
            for (const key of keys) {
                if (Object.prototype.hasOwnProperty.call(this.element.style, key)) {
                    this.element.style.setProperty(key.replace(/([A-Z])/g, "-$1").toLowerCase(), attributes[key], important);
                }
            }
            return true;
        }
        setText(text) {
            this.element.innerHTML = text;
        }
        getStyle(...attributes) {
            if (!attributes.length)
                return {};
            const result = {};
            const elementStyle = window.getComputedStyle(this.element, null);
            for (const key of attributes) {
                switch (key) {
                    case "innerHTML":
                        result[key] = this.element.innerHTML;
                        break;
                    case "textContent":
                        result[key] = this.element.textContent || "";
                        break;
                    case "innerText":
                        result[key] = this.element.innerText;
                        break;
                    default:
                        if (Object.prototype.hasOwnProperty.call(elementStyle, key)) {
                            result[key] = elementStyle.getPropertyValue(key);
                        }
                }
            }
            return result;
        }
        getAttr(key) {
            return String(this.element.getAttribute(key));
        }
        mountElementTo(mountElement, append = false, position = "bottom", insertBefore) {
            if (!mountElement)
                return false;
            if (mountElement instanceof AGElement)
                mountElement = mountElement.element;
            if (insertBefore && insertBefore instanceof AGElement)
                insertBefore = insertBefore.element;
            if (!append) {
                let selector = "";
                if (this.element.id)
                    selector = `#${this.element.id}`;
                if (this.element.className)
                    selector = `.${this.element.className}`;
                if (selector)
                    document.querySelectorAll(selector).forEach((item) => item.remove());
            }
            switch (position) {
                case "top":
                    mountElement.prepend(this.element);
                    break;
                case "bottom":
                    mountElement.append(this.element);
                    break;
                case "insert":
                    if (insertBefore) {
                        mountElement.insertBefore(this.element, insertBefore);
                    }
                    else
                        new Error("error:insertBefore cannot be empty...");
                    break;
            }
            return true;
        }
        static mountElementsTo(elements, mountElement, position = "bottom", insertBefore) {
            if (!mountElement || !elements)
                return false;
            elements.forEach((element) => {
                if (element instanceof AGElement)
                    element = element.element;
                if (mountElement instanceof AGElement)
                    mountElement = mountElement.element;
                if (insertBefore && insertBefore instanceof AGElement)
                    insertBefore = insertBefore.element;
                switch (position) {
                    case "top":
                        mountElement.prepend(element);
                        break;
                    case "bottom":
                        mountElement.append(element);
                        break;
                    case "insert":
                        if (insertBefore) {
                            mountElement.insertBefore(element, insertBefore);
                        }
                        else {
                            throw new Error("error:insertBefore cannot be empty...");
                        }
                        break;
                }
            });
            return true;
        }
        static toAGElement(element) {
            const ele = new AGElement(element.tagName);
            ele.element = element;
            return ele;
        }
    }
    class AAGMethods {
    }
    class AGMethods extends AAGMethods {
        createGlobalErrorHandler() {
            window.addEventListener("unhandledrejection", (event) => {
                console.log(event);
            });
            window.onerror = (message, source, lineno, colno, error) => {
                console.log(message, error);
            };
        }
    }
    class AUser {
    }
    class User extends AUser {
        uid;
        nick;
        address;
        password;
        kami;
        constructor(params) {
            super();
            const init = {
                uid: "",
                nick: "未登录",
                address: "",
                password: "",
                kami: "0/0",
            };
            const { uid, nick, address, password, kami } = params || init;
            this.uid = uid || init.uid;
            this.nick = nick || init.nick;
            this.address = address || init.address;
            this.password = password || init.password;
            this.kami = kami || init.kami;
        }
        static isUser(params) {
            if (!(params instanceof Object))
                return false;
            const keys = Object.keys(params);
            if (keys.length != 4 ||
                !keys.includes("uid") ||
                !keys.includes("nick") ||
                !keys.includes("address") ||
                !keys.includes("password"))
                return false;
            return true;
        }
        static coverText(text, leftShow, rightShow) {
            const str = String(text);
            const result = `${str.substring(0, leftShow)}...${str.substring(str.length - rightShow, str.length)}`;
            return result;
        }
    }
    class APanel extends AGMethods {
    }
    class PanelImpl extends APanel {
        AGStyles = "";
        AGStorage = AGStorage.getInstance();
        AGRequest = AGRequest.getInstance();
        static instance;
        panel;
        draw;
        statusBar;
        user;
        constructor(panelName) {
            super();
            // 初始化爱果全局异常监听事件
            this.createGlobalErrorHandler();
            // 初始化爱果全局样式
            const style = new AGElement("style");
            this.AGStyles += `
        li.ag-options[ag-active="true"] { color:orange;  }
        li.ag-options:hover { color:orange; }
        li.ag-options { color:#999999; }

        .ag-row-margin-10 { margin:10px 0;}
        `;
            style.setText(this.AGStyles);
            style.mountElementTo(document.head);
            // 初始化爱果用户信息
            this.user = new User(this.AGStorage.get("user", "local", true));
            // 初始化爱果面板
            const panel = new AGElement("panel", panelName);
            panel.setStyle({
                width: "25px",
                height: "450px",
                position: "fixed",
                zIndex: "9999",
                left: "0",
                top: "0",
                backgroundColor: "#121212",
                border: "1px solid #434343",
                transition: "width 0.5s ease",
                display: "flex",
                color: "#999999",
                borderRadius: "0 5px 5px 0",
            });
            this.panel = panel;
            // 初始化画板
            this.draw = new AGElement("div");
            // 初始化状态栏
            this.statusBar = new AGElement("div", "ag-draw");
            // 菜单列表
            const options = [
                {
                    label: "前言",
                    event: () => {
                        console.log("前言 begin");
                        const ulItem = new AGElement("ul", "ag-draw");
                        ulItem.setStyle({
                            paddingLeft: "20px",
                            cursor: "default",
                            overflowX: "hidden",
                            margin: "0",
                        });
                        const messages = [
                            {
                                textContent: "本工具为个人制作，仅供交流学习使用，请不要用于商业传播，否则后果自负！使用本工具即代表您同意本条款。",
                                color: "",
                                backgroundColor: "",
                            },
                            {
                                textContent: "工具的初衷是为了让使用者释放双手，解决方案并未包含入侵的攻击和技术，仅模拟人工打开相应的任务进行操作，对程序本身不会造成任何影响，如果对平台技术层面有影响请转告我们。",
                                color: "",
                                backgroundColor: "",
                            },
                            {
                                textContent: "使用者在使用本软件前已经得知可能涉嫌《非法入侵计算机信息系统罪》，但滥用本软件造成的—切后果自行承担!",
                                color: "",
                                backgroundColor: "",
                            },
                            {
                                textContent: "使用方法：点击【开始任务】即可自动完成电脑端每日任务（除【登录】任务），期间可以切到后台，但不要最小化，中断后可以点击【开始/继续任务】即可继续任务。",
                                color: "white",
                                backgroundColor: "orange",
                            },
                        ];
                        for (const item of messages) {
                            const liItem = new AGElement("li");
                            const { textContent, color, backgroundColor } = item;
                            liItem.setText(textContent);
                            liItem.setStyle({
                                color,
                                backgroundColor,
                                margin: "5px 0",
                            });
                            liItem.mountElementTo(ulItem);
                        }
                        ulItem.mountElementTo(this.draw);
                        console.log("前言 end");
                    },
                },
                {
                    label: "开始",
                    event: () => {
                        console.log("开始...");
                        const divStatusBar = this.statusBar;
                        this.statusBar.setStyle({
                            height: "30px",
                            lineHeight: "30px",
                        });
                        this.setStatusBarText("未开始");
                        const ulItem = new AGElement("ul", "ag-draw");
                        ulItem.setStyle({
                            fontSize: "15px",
                            cursor: "default",
                            overflowX: "hidden",
                            color: "orange",
                            margin: "0",
                            marginBottom: "15px",
                            height: "332px",
                            backgroundColor: "#1e1e1e",
                            borderRadius: "10px",
                            display: "inline-table",
                            listStyleType: "decimal",
                        });
                        this.appendMessage(`程序已就绪...`);
                        const buttonItem = new AGElement("button", "ag-draw");
                        buttonItem.setText("开始任务");
                        buttonItem.setStyle({
                            backgroundColor: "#e22b2b00",
                            color: "orange",
                            border: "1px solid orange",
                            borderRadius: "10px",
                            height: "28px",
                            fontSize: "14px",
                            margin: "0 auto",
                            padding: "0 70px",
                            width: "auto",
                            cursor: "pointer",
                        });
                        buttonItem.toHTMLElement().onclick = () => {
                            console.log("点击..");
                        };
                        divStatusBar.mountElementTo(this.draw);
                        ulItem.mountElementTo(this.draw, true);
                        buttonItem.mountElementTo(this.draw, true);
                    },
                },
                {
                    label: "配置",
                    event: () => {
                        console.log("配置　begin");
                        const formItem = new AGElement("form", "ag-draw");
                        formItem.setStyle({
                            display: "inline-flex",
                            flexWrap: "wrap",
                            justifyContent: "space-around",
                        });
                        const addressDivItem = new AGElement("div", "ag-row-margin-10");
                        addressDivItem.setStyle({
                            maxWidth: "175px",
                        });
                        const addressDivNameItem = new AGElement("div");
                        addressDivNameItem.setText("地址：");
                        const addressInputItem = new AGElement("input");
                        addressInputItem.setStyle({
                            height: "30px",
                            border: "1px solid orange",
                            background: "#ff000000",
                            borderRadius: "3px",
                        });
                        addressDivNameItem.mountElementTo(addressDivItem);
                        addressInputItem.mountElementTo(addressDivItem);
                        addressDivItem.mountElementTo(formItem);
                        const passwordDivItem = new AGElement("div", "ag-row-margin-10");
                        passwordDivItem.setStyle({
                            maxWidth: "175px",
                        });
                        const passwordDivNameItem = new AGElement("div");
                        passwordDivNameItem.setText("卡密：");
                        const passwordInputItem = new AGElement("input");
                        passwordInputItem.setAttr("type", "password");
                        passwordInputItem.setStyle({
                            height: "30px",
                            border: "1px solid orange",
                            background: "#ff000000",
                            borderRadius: "3px",
                        });
                        passwordDivNameItem.mountElementTo(passwordDivItem);
                        passwordInputItem.mountElementTo(passwordDivItem);
                        passwordDivItem.mountElementTo(formItem);
                        const questionBankDivItem = new AGElement("div", "ag-row-margin-10");
                        questionBankDivItem.setStyle({
                            width: "175px",
                        });
                        const questionBankNameDivItem = new AGElement("div");
                        questionBankNameDivItem.setText("题库（配置）：");
                        const questionBankInputItem = new AGElement("input");
                        questionBankInputItem.setAttr("type", "password");
                        questionBankInputItem.setStyle({
                            height: "30px",
                            border: "1px solid orange",
                            background: "#ff000000",
                            borderRadius: "3px",
                            width: "110px",
                        });
                        const questionBankSettingsDivItem = new AGElement("div");
                        questionBankSettingsDivItem.setText(`<input type='checkbox'>启用`);
                        questionBankSettingsDivItem.setStyle({
                            display: "initial",
                            padding: "0 5px",
                        });
                        questionBankNameDivItem.mountElementTo(questionBankDivItem);
                        questionBankInputItem.mountElementTo(questionBankDivItem);
                        questionBankSettingsDivItem.mountElementTo(questionBankDivItem);
                        questionBankDivItem.mountElementTo(formItem);
                        const divItem = new AGElement("div", "ag-row-margin-10");
                        divItem.setStyle({
                            width: "175px",
                        });
                        divItem.mountElementTo(formItem);
                        formItem.mountElementTo(this.draw);
                        const divSplitLine = new AGElement("div", "ag-draw");
                        divSplitLine.setStyle({
                            width: "100%",
                            height: "1px",
                            background: "#999999",
                            margin: "10px 0",
                        });
                        divSplitLine.mountElementTo(this.draw, true);
                        const divTasksItem = new AGElement("table", "ag-draw");
                        divTasksItem.setStyle({
                            margin: "10px 0",
                            textAlign: "center",
                        });
                        divTasksItem.setText(`
                <tr>
                  <th>任务</th>
                  <th>启用</th>
                </tr>
              `);
                        const tasks = [
                            {
                                name: "每日答题",
                                status: false,
                                event: () => { },
                            },
                            {
                                name: "专项答题",
                                status: false,
                                event: () => { },
                            },
                            {
                                name: "每周答题",
                                status: false,
                                event: () => { },
                            },
                            {
                                name: "视听学习/时长",
                                status: false,
                                event: () => { },
                            },
                            {
                                name: "我要选读文章",
                                status: false,
                                event: () => { },
                            },
                        ];
                        tasks.forEach((item) => {
                            const { name } = item;
                            const taskItemTr = new AGElement("tr");
                            const taskNameTd = new AGElement("td");
                            const taskStatusTd = new AGElement("td");
                            taskNameTd.setText(name);
                            taskNameTd.mountElementTo(taskItemTr);
                            const taskItemInput = new AGElement("input");
                            taskItemInput.setAttr("type", "checkbox");
                            taskItemInput.setStyle({
                                width: "14px",
                                height: "14px",
                            });
                            taskItemInput.mountElementTo(taskStatusTd);
                            taskStatusTd.mountElementTo(taskItemTr);
                            taskItemTr.mountElementTo(divTasksItem);
                        });
                        divTasksItem.mountElementTo(this.draw, true);
                        console.log("配置　end");
                    },
                },
                {
                    label: "捐助",
                    event: () => {
                        console.log("捐助 begin");
                        const divItem = new AGElement("div", "ag-draw");
                        const pItem = new AGElement("p");
                        pItem.setText(`到底为什么要开学考试，真的很打咩好吗！！！`);
                        pItem.setStyle({
                            fontSize: "50px",
                            color: "orange",
                        });
                        pItem.mountElementTo(divItem);
                        divItem.mountElementTo(this.draw);
                        console.log("捐助 end");
                    },
                },
            ];
            // 左列
            const columnLeft = new AGElement("div");
            columnLeft.setStyle({
                backgroundColor: "#292929",
                width: "150px",
                height: "100%",
                display: "none",
            });
            {
                const rowOne = new AGElement("div");
                rowOne.setStyle({
                    height: "30px",
                });
                const rowTwo = new AGElement("div");
                rowTwo.setStyle({
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                });
                const rowTowItem = new AGElement("span");
                console.log(this.user);
                rowTowItem.setText(this.user.nick);
                rowTowItem.setStyle({
                    height: "80px",
                    width: "80px",
                    backgroundColor: "#121212",
                    borderRadius: "100%",
                    display: "block",
                    lineHeight: "80px",
                    textAlign: "center",
                    overflowY: "hidden",
                    fontSize: "20px",
                    cursor: "default",
                });
                rowTowItem.mountElementTo(rowTwo);
                const rowThree = new AGElement("div");
                rowThree.setText(User.coverText(this.user.uid, 3, 3));
                rowThree.setStyle({
                    height: "20px",
                    lineHeight: "20px",
                    color: "#bfbfbf",
                    textAlign: "center",
                    margin: "5px 0",
                    fontSize: "18px",
                    cursor: "default",
                });
                const rowFour = new AGElement("div");
                rowFour.setText(`卡密次数: ${this.user.kami} <span style='color:#2579cd;cursor:pointer'>说明</span>`);
                rowFour.setStyle({
                    height: "20px",
                    lineHeight: "20px",
                    textAlign: "center",
                    margin: "5px 0",
                    fontSize: "13px",
                    marginTop: "10px",
                    cursor: "default",
                });
                AGElement.mountElementsTo([rowOne, rowTwo, rowThree, rowFour], columnLeft);
                const menu = new AGElement("ul");
                menu.setStyle({
                    listStyleType: "none",
                    letterSpacing: "10px",
                    paddingLeft: "0",
                    textAlign: "center",
                    marginTop: "20px",
                });
                menu.mountElementTo(columnLeft);
                const agOptionsActive = this.AGStorage.get("options_active");
                for (const item of options) {
                    const li = new AGElement("li", `ag-options`);
                    li.toHTMLElement().setAttribute("ag-title", item.label);
                    li.setText(item.label);
                    li.setStyle({
                        cursor: "pointer",
                        height: "40px",
                        lineHeight: "40px",
                        fontSize: "16px",
                    });
                    li.toHTMLElement().onclick = () => {
                        item.event();
                        const ele = document.querySelector("[ag-active=true]");
                        if (ele && ele instanceof HTMLElement) {
                            AGElement.toAGElement(ele).setAttr("ag-active", false);
                        }
                        li.setAttr("ag-active", "true");
                        const agTitle = li.getAttr("ag-title");
                        if (agTitle)
                            this.AGStorage.set("options_active", agTitle);
                    };
                    if (item.label == agOptionsActive) {
                        setTimeout(() => li.toHTMLElement().click(), 0);
                    }
                    li.mountElementTo(menu);
                }
            }
            // 中列
            const columnCenter = new AGElement("div");
            columnCenter.setStyle({
                width: "425px",
                height: "100%",
                display: "none",
            });
            {
                const rowOne = new AGElement("div");
                rowOne.setText(`爱果 - 学XX国 v23.X.X`);
                rowOne.setStyle({
                    height: "30px",
                    lineHeight: "30px",
                    textAlign: "center",
                    fontSize: "15px",
                });
                const rowTwo = this.draw;
                rowTwo.setStyle({
                    height: "420px",
                    display: "flex",
                    padding: "0 15px",
                    flexDirection: "column",
                });
                AGElement.mountElementsTo([rowOne, rowTwo], columnCenter);
            }
            // 右列
            const columnRight = new AGElement("div");
            columnRight.setText(`展开控制台`);
            columnRight.setStyle({
                backgroundColor: "#121212",
                width: "25px",
                height: "100%",
                display: "inline-flex",
                alignItems: "center",
                textAlign: "center",
                cursor: "pointer",
                position: "absolute",
                right: "0",
                top: "0",
                fontWeight: "bold",
                borderLeft: "1px solid #434343",
                borderRadius: "0 5px 5px 0",
            });
            columnRight.toHTMLElement().onclick = () => {
                const styles = panel.getStyle("textContent");
                const status = styles["textContent"].includes("展开");
                let width = status ? "600px" : "25px";
                let textContent = status ? "收起控制台" : "展开控制台";
                let display = status ? "block" : "none";
                panel.setStyle({
                    width,
                });
                setTimeout(() => {
                    columnRight.setText(textContent);
                    columnLeft.setStyle({
                        display,
                    });
                    columnCenter.setStyle({
                        display,
                    });
                }, status ? 200 : 0);
            };
            AGElement.mountElementsTo([columnLeft, columnCenter, columnRight], panel);
        }
        static getInstance(panelName) {
            console.log(`panel:实例化 begin`);
            if (panelName && !this.instance)
                this.instance = new PanelImpl(panelName);
            console.log(`panel:实例化 end`);
            return this.instance;
        }
        mount() {
            console.log("panel:挂载 begin");
            const result = this.panel.mountElementTo(document.body, false, "top");
            console.log(`panel:挂载${result ? "成功" : "失败"} end`);
        }
        setStatusBarText(text) {
            Promise.resolve().then(() => {
                this.statusBar.setText(`状态栏：${text}`);
            });
        }
        appendMessage(message) {
            const liItem = new AGElement("li");
            liItem.setText(`${new Date().toLocaleTimeString()}：${message}`);
            liItem.setStyle({
                margin: "5px 0",
            });
            Promise.resolve().then(() => {
                const ul = this.draw.toHTMLElement().children[1];
                if (ul && ul instanceof HTMLElement)
                    liItem.mountElementTo(ul);
            });
        }
    }
    PanelImpl.getInstance(`ag-panel`).mount();
})();
