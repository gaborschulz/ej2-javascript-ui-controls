import { LayoutViewer } from '../viewer';
import { L10n, createElement } from '@syncfusion/ej2-base';
import { ListView } from '@syncfusion/ej2-lists';
import { Button } from '@syncfusion/ej2-buttons';
import { RestrictEditing } from './restrict-editing-pane';
import { DialogUtility } from '@syncfusion/ej2-popups';
/**
 * @private
 */
export class AddUserDialog {
    private viewer: LayoutViewer;
    private target: HTMLElement;
    private textBoxInput: HTMLInputElement;
    private userList: ListView;
    private addButton: Button;
    private owner: RestrictEditing;
    constructor(viewer: LayoutViewer, owner: RestrictEditing) {
        this.viewer = viewer;
        this.owner = owner;
    }

    /**
     * @private
     */
    public initUserDialog(localValue: L10n, isRtl?: boolean): void {
        let instance: AddUserDialog = this;
        let id: string = this.viewer.owner.containerId + '_addUser';
        this.target = createElement('div', { id: id, className: 'e-de-user-dlg' });
        let headerValue: string = localValue.getConstant('Enter User');
        let dlgFields: HTMLElement = createElement('div', { innerHTML: headerValue, className: 'e-bookmark-dlgfields' });
        this.target.appendChild(dlgFields);

        let commonDiv: HTMLElement = createElement('div', { className: 'e-de-user-dlg-common' });
        this.target.appendChild(commonDiv);

        let adduserDiv: HTMLElement = createElement('div', { className: 'e-de-user-dlg-list', styles: 'display:inline-flex' });
        commonDiv.appendChild(adduserDiv);
        if (isRtl) {
            adduserDiv.classList.add('e-de-rtl');
        }

        let textBoxDiv: HTMLElement = createElement('div', { className: 'e-de-user-dlg-textboxdiv' });
        adduserDiv.appendChild(textBoxDiv);
        // tslint:disable-next-line:max-line-length
        this.textBoxInput = createElement('input', { className: 'e-input e-de-user-dlg-textbox-input', id: 'bookmark_text_box', attrs: { autofocus: 'true' } }) as HTMLInputElement;
        this.textBoxInput.setAttribute('type', 'text');
        textBoxDiv.appendChild(this.textBoxInput);
        this.textBoxInput.addEventListener('keyup', instance.onKeyUpOnDisplayBox);

        let addButtonElement: HTMLElement = createElement('button', {
            innerHTML: localValue.getConstant('Add'), id: 'add',
            attrs: { type: 'button' }
        });
        adduserDiv.appendChild(addButtonElement);
        addButtonElement.addEventListener('click', this.addButtonClick);
        this.addButton = new Button({ cssClass: 'e-de-user-add-btn' });
        this.addButton.disabled = true;
        this.addButton.appendTo(addButtonElement);
        this.addButton.addEventListener('click', this.addButtonClick);
        let userCollectionDiv: HTMLElement = createElement('div');
        commonDiv.appendChild(userCollectionDiv);
        let userDiv: HTMLElement = createElement('div', { innerHTML: localValue.getConstant('Users'), className: 'e-de-user-dlg-user' });
        userCollectionDiv.appendChild(userDiv);
        let listviewDiv: HTMLElement = createElement('div', { id: 'user_listView' });
        userCollectionDiv.appendChild(listviewDiv);

        this.userList = new ListView({
            cssClass: 'e-de-user-listview'
        });

        this.userList.appendTo(listviewDiv);


    }
    /**
     * @private
     */
    public show = (): void => {
        let localObj: L10n = new L10n('documenteditor', this.viewer.owner.defaultLocale);
        localObj.setLocale(this.viewer.owner.locale);
        if (!this.target) {
            this.initUserDialog(localObj, this.viewer.owner.enableRtl);
        }
        this.viewer.dialog.header = localObj.getConstant('Add Users');
        this.viewer.dialog.height = 'auto';
        this.viewer.dialog.width = 'auto';
        this.viewer.dialog.content = this.target;
        this.viewer.dialog.beforeOpen = this.loadUserDetails;
        this.viewer.dialog.close = this.viewer.updateFocus;
        this.viewer.dialog.buttons = [
            {
                click: this.okButtonClick,
                buttonModel: {
                    content: localObj.getConstant('Ok'), cssClass: 'e-flat', isPrimary: true
                }
            },
            {
                click: this.hideDialog,
                buttonModel: { content: localObj.getConstant('Cancel'), cssClass: 'e-flat' }
            }, {
                click: this.deleteButtonClick,
                buttonModel: { content: localObj.getConstant('Delete'), cssClass: 'e-flat e-user-delete' }
            }];
        this.viewer.dialog.dataBind();
        this.viewer.dialog.show();
    }

    public loadUserDetails = (): void => {
        this.viewer.restrictEditingPane.addedUser.dataSource = this.viewer.userCollection;
        this.viewer.restrictEditingPane.addedUser.refresh();
    }
    /**
     * @private
     */
    public okButtonClick = (): void => {
        this.viewer.restrictEditingPane.showStopProtectionPane(false);
        this.viewer.restrictEditingPane.loadPaneValue();
        this.viewer.dialog.hide();
    }

    /**
     * @private
     */
    public hideDialog = (): void => {
        this.textBoxInput.value = '';
        this.viewer.dialog.hide();
    }

    /**
     * @private
     */
    public onKeyUpOnDisplayBox = (): void => {
        this.addButton.disabled = this.textBoxInput.value === '';
    }
    public addButtonClick = (): void => {
        if (this.validateUserName(this.textBoxInput.value)) {
            if (this.viewer.userCollection.indexOf(this.textBoxInput.value) === -1) {
                this.viewer.userCollection.push(this.textBoxInput.value);
            }
            this.userList.dataSource = this.viewer.userCollection;
            this.userList.refresh();
            this.textBoxInput.value = '';
        } else {
            DialogUtility.alert('Invalid user name');
        }
    }
    public validateUserName(value: string): boolean {
        if (value.indexOf('@') === -1) {
            return false;
        } else {
            let parts: string[] = value.split('@');
            let domain: string = parts[1];
            if (domain.indexOf('.') === -1) {
                return false;
            } else {
                let domainParts: string[] = domain.split('.');
                let ext: string = domainParts[1];
                if (domainParts.length > 2) {
                    return false;
                }
                if (ext.length > 4 || ext.length < 2) {
                    return false;
                }
            }

        }

        return true;

    }
    public deleteButtonClick = (): void => {
        let index: number = this.viewer.userCollection.indexOf(this.userList.getSelectedItems().text as string);
        if (index > -1) {
            this.viewer.userCollection.splice(index, 1);
            this.userList.dataSource = this.viewer.userCollection;
            this.userList.refresh();
        }
    }
}