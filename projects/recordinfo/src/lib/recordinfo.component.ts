import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChange } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { isArray } from 'util';
import { Tile, DefaultValue } from './recordTile.class';
import { ErrorMessage } from './message.enum';

import {
    trigger,
    state,
    style,
    animate,
    transition,
    // ...
} from '@angular/animations';
declare var XML: any;
declare var $: any;
declare var jsonPath: any;
declare var JSONPath: any;
@Component({
    selector: 'amberdata-recordinfo',
    template: `
    <div class="record--info--wrap" [style.width]="formWidth + 'px'">
    <mat-grid-list [gutterSize]="'0px'" #container cols="18" rowHeight="10px">
        <mat-grid-tile  class="grid--border--box" *ngFor="let tile of tiles;let i = index" [colspan]="tile.options.cols" [rowspan]="tile.options.rows"
        [style.borderLeft]="tile.getStyle('border-left')"
        [style.borderRight]="tile.getStyle('border-right')"
        [style.borderTop]="tile.getStyle('border-top')"
        [style.borderBottom]="tile.getStyle('border-bottom')"  
        [style.background]="tile.getStyle('backgroundColor')">
            <div [ngSwitch]="tile.options.contentType" class="tile--options--content--type--box"
                [style.textAlign]="tile.getStyle('text-align')"
                [style.fontWeight]="tile.getStyle('fontWeight')" 
                [style.color]="tile.getStyle('fontColor')" [style.fontSize]="tile.getStyle('fontSize') + 'px'"
                [style.background]="tile.getStyle('backgroundColor')">
                <div *ngSwitchCase="'label'" class="label--wrap">
                    <span *ngFor="let label of tile.options.labelName" class="label--box">
                         <span class="text-danger" *ngIf="tile.options.required == 'true'">. </span>
                            <span *ngIf="label.type == 'text'">{{label.value}}</span>
                            <span *ngIf="label.type == 'attr'">{{entity[label.value]}}</span>
                    </span>  
                </div>
                <div *ngSwitchCase="'input'" class="form--build--box--input--box">
                    <input [style.textAlign]="tile.getStyle('text-align')" type="text"
                        formValidPass 
                        [scene]="scene"
                        [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options"
                        [ngClass]="{'showBorder' : tile.getStyle('inputBorder') == 'show'}" 
                        [disabled]="disableEdit" class="form-control form--build--box--input" 
                        [(ngModel)]="entity[tile.options.attrName]">
                </div>
                <div *ngSwitchCase="'radio-button'" class="radio--build--box">
                    <mat-radio-group [(ngModel)]="entity[tile.options.attrName]" formValidPass [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options">
                        <mat-radio-button [disabled]="disableEdit" class="single--radio--btn" *ngFor="let radioAttr of tile.options.radioBtnAttrs" [value]="radioAttr">{{radioAttr}}</mat-radio-button>
                    </mat-radio-group>
                </div>
                <div *ngSwitchCase="'check-box'" class="radio--build--box">
                    <section  class="example-section form--build--box--input">
                        <mat-checkbox
                        formValidPass [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options"
                        [checked]="isChecked(tile,checkBoxAttr)"
                         [disabled]="disableEdit" (change)="toggleCheckbox($event,tile,checkBoxAttr)" *ngFor="let checkBoxAttr of tile.options.checkBoxAttrs"
                            class="example-margin">{{checkBoxAttr}}</mat-checkbox>
                    </section>
                </div>
                <div *ngSwitchCase="'select'" class="form--build--box--input--box" >
                    <select [ngClass]="{'showBorder' : tile.getStyle('inputBorder') == 'show'}" formValidPass [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options"  [disabled]="disableEdit" class="form-control form--build--box--input" [(ngModel)]="entity[tile.options.attrName]">
                        <option *ngFor="let selectAttr of tile.options.selectAttrs" [value]="selectAttr.value">{{selectAttr.displayName}}</option>
                    </select>
                </div>
                <div *ngSwitchCase="'text-area'" class="form--build--box--input--box">
                    <textarea [ngClass]="{'showBorder' : tile.getStyle('inputBorder') == 'show'}" formValidPass [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options" [disabled]="disableEdit" class="form-control form--build--box--input textarea--input" [(ngModel)]="entity[tile.options.attrName]"></textarea>
                </div>
                <div *ngSwitchCase="'upload'" class="create--record--dialog--upload--box">
                    <span style="margin-left: 8px;">
                        {{tile.options.fileDisplayName}}
                    </span>
                    <div class="head--box">
                        <div *ngIf="!disableEdit">
                            <form-upload class="upload--btn" 
                            [ApiUrl]="ApiUrl"
                            [baseUrl]="baseUrl"
                            [AuthenticationService]="AuthenticationService"
                            [uploadUrl]="'commonUpload'" [attrName]="tile.options.attrName" (uploadFinish)="uploadFinish($event)"></form-upload>
                        </div>
                    </div>
                    <div class="upload--data--list--box">
                        <div  *ngFor="let file of entity[tile.options.attrName];let i = index" class="single--data">
                            <img class="file--type--icon" onerror="this.src='assets/images/icon/unknown.svg'" src="./assets/images/icon/{{file['name'] | fileNameToIcon}}.svg"
                                alt="">
                            <span *ngIf="file.isNew" class="file--name">
                                {{file['name']}}
                            </span>
                            <a *ngIf="!file.isNew" (click)="previewDoc(file['url'])" class="file--name">
                                {{file['name']}}
                            </a>
                            <span *ngIf="!disableEdit" (click)="deleteFile(tile,file,i) " class="delete--btn ti-trash"></span>                          
                        </div>
                    </div>                                      
                </div>

                <div *ngSwitchCase="'date'" class="form--build--box--input--box">                    
                    <nz-date-picker
                    formValidPass [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options"
                    nzShowTime
                     [ngClass]="{'showBorder' : tile.getStyle('inputBorder')  == 'show'}"  [(ngModel)]="entity[tile.options.attrName]"  class="form-control form--build--box--input" [nzFormat]="tile.options.typeFormat"></nz-date-picker>
                </div>
                <div *ngSwitchCase="'process-list'" class="form--build--box--input--box stepper">
                    <mat-horizontal-stepper  labelPosition="bottom" #stepper>
                        <mat-step *ngFor="let progressNode of progressNodes"  [completed]="false">
                            <ng-template matStepLabel>
                                <div class="ode--name"><span>{{progressNode.name}}</span></div>
                                <div><span>操作人：{{progressNode.operator}}</span></div>
                                <div><span>操作时间：{{progressNode.operate_date}}</span></div>
                            </ng-template>
                          <div class="pro--content--box">
                            <div *ngFor="let pro of progressNode.property" class="single--pro">
                              {{pro.title}}：{{pro.content}}
                            </div>
                          </div>
                        </mat-step>
                      </mat-horizontal-stepper>
                </div>
                <div *ngSwitchCase="'table'" class="form--build--box--input--box" style="overflow-y: auto;">
                    <table class="table table-bordered">
                        <tr>
                            <ng-container *ngFor="let tableAttr of tile.options.tableAttrs;let x = index">
                                <th *ngIf="!tableAttr.isNotShow">
                                    {{tableAttr.title}}
                                </th>
                            </ng-container>
                        </tr>
                        <tr *ngFor="let tableEntity of tableEntitys[tile.options.attrName];let e = index">
                            <ng-container *ngFor="let tableAttr of tile.options.tableAttrs;let x = index">
                                <td *ngIf="!tableAttr.isNotShow">
                                    <input [disabled]="disableEdit" type="text" class="form-control form--build--box--input" InitTableValue [tableEntity]="tableEntity" [key]="tableAttr.jsonPath"
                                        [(ngModel)]="tableEntity[tableAttr.jsonPath]">
                                        
                                </td>
                            </ng-container>
                            <td>
                                <button *ngIf="!disableEdit" class="btn btn-default fa fa-minus-circle" (click)="tableEntitys[tile.options.attrName].splice(e,1)"></button>
                            </td>
                        </tr>
                        <tr>
                            <button *ngIf="!disableEdit" class="btn btn-default fa fa-plus-circle" (click)="addTableList(tile.options.attrName)"></button>
                        </tr>
                    </table>
                </div>
                <div *ngSwitchCase="'logo'" class="form--build--box--input--box">
                    <img style="height: 100%;
                    width: 100%;" onerror="this.src = './assets/images/icon-40.png'" [src]="tile.options.logoSrc" alt="">
                </div>
                <div *ngSwitchCase="'other-component'" class="form--build--box--input--box">
                    <form-other-component
                    [disableEdit]="disableEdit"
                    [keyAttrName]="tile.options.keyAttrName"
                    [valueAttrName]="tile.options.attrName"
                    [_DepartmentManageServiceGetList]="_DepartmentManageServiceGetList"
                    [_chooseUsersAccessServiceGetRoleList]="_chooseUsersAccessServiceGetRoleList"
                    [_chooseUsersAccessServiceGetUserByDept]="_chooseUsersAccessServiceGetUserByDept"
                    [_chooseUsersAccessServiceGetUserByRole]="_chooseUsersAccessServiceGetUserByRole"
                    [_dwClassManageServiceGetMetadataCategoryInfo]="_dwClassManageServiceGetMetadataCategoryInfo"
                    [entity]="entity"
                     [componentType]="tile.options.componentType"></form-other-component>
                   
                </div>
                <div *ngSwitchDefault>请选择一个类型</div>
            </div>
        </mat-grid-tile>
    </mat-grid-list>
</div>
  `,
    styleUrls: ['./recordinfo.component.scss']
})
export class RecordinfoComponent implements OnInit {
    deletePath: Array<any> = [];
    subs = new Subscription();
    tiles: Array<Tile> = [];
    xotree = new XML.ObjTree();
    jsonData: any;
    loading: boolean = false;
    saveEntity: any = {};
    tableEntitys: any = {};
    entity: any = {};
    formWidth: number = 700
    progressNodes: any[] = []
    validPass : boolean = true 
    @Input() id: string;
    @Input() disableEdit: boolean;
    @Input() serverFiles: Array<any>;
    @Input() showTemplateXml: any;
    @Input() jsonMetadataTemplate: any;
    @Input() info: any;
    @Input() formType?: 'create' | 'edit'
    @Input() getMulModifeProPertyValues: (allowedValuesCode: string) => Promise<any>
    @Input() getDefaultValue: (defaultValue: DefaultValue) => string

    @Input() _DepartmentManageServiceGetList: () => Promise<any>
    @Input() _chooseUsersAccessServiceGetRoleList: () => Promise<any>
    @Input() _chooseUsersAccessServiceGetUserByDept: (groupName: string) => Promise<any>
    @Input() _chooseUsersAccessServiceGetUserByRole: (groupName: string) => Promise<any>
    @Input() _dwClassManageServiceGetMetadataCategoryInfo: (metadataSchemeId: string) => Promise<any>
    @Input() environmentBaseUrl : string 

    @Input() ApiUrl : any //接口枚举类型
    @Input() baseUrl : string //上传所需url跟地址
    @Input() AuthenticationService : any //用户服务 
    @Input() scene?: string
    constructor() { }

    ngOnInit() {
    }

    isChecked(tile, attr) {
        let str = this.entity[tile.options.attrName]
        if (!str) {
            str = []
        } else {
            str = str.split(',')
        }
        str = _.castArray(str)
        return str.indexOf(attr) >= 0
    }

    async getTemplateModule() {
        try {
            this.loading = true
            this.serverFiles = this.serverFiles || []
            let json = this.jsonMetadataTemplate
            this.jsonData = json
            this.getShowTemplate()
            this.formatShowJson(this.jsonData.record)
            if (!this.entity['$.record.block.file']) this.entity['$.record.block.file'] = []
            this.serverFiles.forEach(file => {
                this.entity['$.record.block.file'].push({
                    'size': file['s_content_size'],
                    'name': file['s_object_name'],
                    'md5': file['s_md5'],
                    'url': 'repo:' + file['jcr:path'],
                    'isNew': true
                })
            })
            this.loading = false
        } catch (err) {
            console.error(err)
            this.loading = false
            return
        }
    }

    /**
     * 将重复的block整合成一个block,值存进一个content中
     * @param jsonData 
     */
    formatShowJson(jsonData) {
        if (jsonData.file) jsonData.file = _.castArray(jsonData.file)
        if (jsonData.property) {
            jsonData.property = _.castArray(jsonData.property)
            jsonData.property.forEach(pro => {
                delete pro.allowedValues
                delete pro.allowedValuesCode
            });
        }
        if (jsonData.node) {
            jsonData.node = _.castArray(jsonData.node)
            this.progressNodes = jsonData.node
        }
        if (jsonData.block) {
            jsonData.block = _.castArray(jsonData.block)
            jsonData.block.forEach(block => {
                let length = jsonData.block.filter(c => c.name == block.name).length
                if (length > 1) block.can_repeat = 'true'
            });
        }
        if (jsonData.block) {
            let copy_jsonData_blocks = _.cloneDeep(jsonData.block)
            copy_jsonData_blocks.forEach(block => {
                let copyBlock = _.cloneDeep(block)
                if (copyBlock.can_repeat == 'true') {
                    let blocks = copy_jsonData_blocks.filter(c => c.name == copyBlock.name)
                    _.remove(jsonData.block, (n) => n['name'] == copyBlock.name)
                    copyBlock.property.forEach(property => {
                        property.content = []
                        blocks.forEach(repeat_block => {
                            property.content.push(repeat_block.property.find(pro => pro.name == property.name).content)
                        });
                    });
                    jsonData.block.push(copyBlock)
                }
            });
            jsonData.block.forEach(c => {
                this.formatShowJson(c)
            });
        }
    }

    async getShowTemplate() {
        let xmlData = this.showTemplateXml
        this.formWidth = Number(this.xotree.parseXML(this.showTemplateXml).data.formWidth) || 700
        let data = this.xotree.parseXML(xmlData).data.saveData
        data.forEach(option => {
            if (!option.style) option.style = {}
            option.radioBtnAttrs = _.castArray(option.radioBtnAttrs);
            option.checkBoxAttrs = _.castArray(option.checkBoxAttrs);
            option.selectAttrs = _.castArray(option.selectAttrs);
            option.getMulModifeProPertyValues = this.getMulModifeProPertyValues,
                this.tiles.push(new Tile(option))
        })
        data.forEach(c => {
            if (c.keyAttrName) {
                if (c.contentType != 'table' && c.contentType != 'upload') {
                    if (jsonPath(this.jsonData, c.keyAttrName) !== false) {
                        this.entity[c.keyAttrName] = jsonPath(this.jsonData, c.keyAttrName)[0]
                    } else {
                        this.entity[c.keyAttrName] = ''
                    }
                }
            }
            if (c.attrName) {
                if (c.contentType != 'table' && c.contentType != 'upload') {
                    if (jsonPath(this.jsonData, c.attrName) !== false) {
                        this.entity[c.attrName] = jsonPath(this.jsonData, c.attrName)[0]
                        return
                    }
                    if (this.formType == 'create') {
                        let tile: Tile = this.tiles.find((row: Tile) => row.options.attrName == c.attrName)
                        this.entity[c.attrName] = this.getDefaultValue(tile.options.defaultValue)
                    } else {
                        this.entity[c.attrName] = ''
                    }
                } else if (c.contentType == 'upload') {
                    let path = c.attrName
                    let files = jsonPath(this.jsonData, path)
                    this.entity[c.attrName] = this.entity[c.attrName] || []
                    if (files == false) {
                        return
                    }
                    if (Array.isArray(files[0])) {
                        files = files[0]
                    }
                    files.forEach(file => {
                        // && !this.entity[c.attrName].find(f => f.md5 == file.md5)
                        if (file.name && file.md5) {
                            this.entity[c.attrName].push(file)
                        }
                    });
                } else {
                    this.tableEntitys[c.attrName] = []
                    c.tableAttrs.forEach(tableAttr => {
                        let datas = jsonPath(this.jsonData, tableAttr.jsonPath)
                        if (!datas) {
                            return
                        }
                        let data = _.castArray(datas)
                        if (data) {
                            for (let x = 0; x < data.length; x++) {
                                if (!this.tableEntitys[c.attrName][x]) {
                                    this.tableEntitys[c.attrName].push({})
                                }
                                this.tableEntitys[c.attrName][x][tableAttr.jsonPath] = data[x]
                            }
                        }
                    });
                }
            }
        })
    }

    addTableList(jsonPath) {
        if (!this.tableEntitys[jsonPath]) {
            this.tableEntitys[jsonPath] = []
        }
        this.tableEntitys[jsonPath].push({})
    }
    async editRecord() {
        let tableEntitys = _.cloneDeep(this.tableEntitys)
        this.saveEntity = _.cloneDeep(this.entity)
        for (let key in tableEntitys) {
            tableEntitys[key].forEach(tableEntity => {
                for (let tableKey in tableEntity) {
                    if (!this.saveEntity[tableKey]) {
                        this.saveEntity[tableKey] = []
                    }
                    this.saveEntity[tableKey].push(tableEntity[tableKey])
                }
            });
        }
        var jsonData = _.cloneDeep(this.jsonData)
        // 先去除数组，保证jsonPath能对应
        this.formatArrayItems(jsonData.record)
        // 根据jsonPath填入数据
        this.formatServiceData(jsonData)

        // 把所有单个对象转换成数组
        this.formatObjTOArray(jsonData.record)
        // 将可重复block拆分成多个blcok
        this.formatTableEntity(jsonData.record)
        // 重新转换回正确的服务端需要格式
        this.formatArrayItems(jsonData.record)
        this.deleteEmptyFile(jsonData.record)
        this.validPass = this.checkFormValidator()
        if (!this.validPass) {
            return false
        }
        this.info.jsonData = jsonData
        return true
    }

    checkFormValidator() {
        var validPass = true
        this.tiles.forEach((tile: Tile) => {
            tile.options.scene = tile.options.scene || ''
            if (!tile.options.scene) {
                return
            }
            if (tile.options.scene.indexOf(this.scene) != -1) {
                if (tile.options.isRequired == 'true' && !this.entity[tile.options.attrName]) {
                    validPass = false
                } else if (tile.options.valueType == 'int' && _.isNumber(this.entity[tile.options.attrName])) {
                    validPass = false
                }
            } else {
                return
            }
        })
        return validPass
    }

    formatObjTOArray(jsonData) {
        if (jsonData.file) {
            jsonData.file = _.castArray(jsonData.file)
        }
        if (jsonData.property) {
            jsonData.property = _.castArray(jsonData.property)
        }
        if (jsonData.node) {
            jsonData.node = _.castArray(jsonData.node)
        }
        if (jsonData.block) {
            jsonData.block = _.castArray(jsonData.block)
            jsonData.block.forEach(c => {
                this.formatShowJson(c)
            });
        }
    }

    deleteEmptyFile(jsonData) {
        if (jsonData.file && Array.isArray(jsonData.file)) {
            _.remove(jsonData.file, (c => {
                return !c['size'] && !c['name'] && !c['md5']
            }))
        } else if (jsonData.file && !Array.isArray(jsonData.file)) {
            if (!jsonData.file.size && !jsonData.file.name && !jsonData.file.md5) {
                jsonData.file = []
            }
        }
        if (jsonData.block) {
            if (Array.isArray(jsonData.block)) {
                jsonData.block.forEach(c => {
                    this.deleteEmptyFile(c)
                });
            } else {
                this.deleteEmptyFile(jsonData.block)
            }
        }
    }

    formatArrayItems(jsonData) {
        if (jsonData.file && Array.isArray(jsonData.file) && jsonData.file.length == 1) {
            jsonData.file = jsonData.file[0]
        }
        if (jsonData.property && Array.isArray(jsonData.property) && jsonData.property.length == 1) {
            jsonData.property = jsonData.property[0]
        }
        if (jsonData.block && Array.isArray(jsonData.block) && jsonData.block.length == 1) {
            jsonData.block = jsonData.block[0]
            delete jsonData.block.can_repeat
            this.formatArrayItems(jsonData.block)
        } else if (jsonData.block && Array.isArray(jsonData.block) && jsonData.block.length > 1) {
            jsonData.block.forEach(block => {
                delete block.can_repeat
                this.formatArrayItems(block)
            })
        }
    }

    /**
     * 将单个可重复block的属性多值分解成多个block
     */
    formatTableEntity(jsonData) {
        if (jsonData.block) {
            jsonData.block.forEach((b) => {
                if (b.can_repeat == 'true') {
                    let block = _.cloneDeep(b)
                    let property = {}
                    block.property.forEach(pro => {
                        if (!property[pro.name]) {
                            property[pro.name] = {}
                        }
                        property[pro.name].content = _.cloneDeep(pro.content)
                    })
                    let repeat_block = []
                    for (let key in property) {
                        if (property[key].content) {
                            for (let i = 0; i < property[key].content.length; i++) {
                                if (!repeat_block[i]) {
                                    repeat_block[i] = _.cloneDeep(block)
                                    repeat_block[i].property.forEach(pro => {
                                        pro.content = ''
                                    });
                                }
                                repeat_block[i].property.find(pro => {
                                    return pro.name == key
                                }).content = property[key].content[i]
                            }
                        }
                    }
                    jsonData.block = jsonData.block.concat(repeat_block)
                    _.remove(jsonData.block, (n) => {
                        return n == b
                    })
                    return
                }
                this.formatTableEntity(b)
            })
        }
    }

    formatServiceData = (jsonData) => {
        //根据saveEntity对象，将值填入this.nodes对象中
        for (let key in this.saveEntity) {
            let path = key.replace('.file', '')
            let result = JSONPath.JSONPath({ path: path, json: jsonData, resultType: 'all' })
            if (result[0]) {
                //   根据deletePath,去掉json中的被删除文件
                if (isArray(this.saveEntity[key])) {
                    //父节点是{file:{name:xx,size:xx}}这种情况
                    if (result[0].parentProperty == 'file') {
                        _.remove(result[0].parent[result[0].parentProperty], (file) => {
                            return file['url'] && this.deletePath.indexOf(file['url']) >= 0
                        })
                    } else {
                        //父节点是{file:[{name:xx,size:xx},{name:}]}情况
                        if (!Array.isArray(result[0].value.file) && result[0].value.file) {
                            if (this.deletePath.indexOf(result[0].value.file.url) >= 0) {
                                delete result[0].value.file
                            }
                        } else {
                            _.remove(result[0].value.file, (file) => {
                                return file['url'] && this.deletePath.indexOf(file['url']) >= 0
                            })
                        }
                    }
                }
                if (!this.saveEntity[key] || this.saveEntity[key].length == 0) {
                    continue
                }
                if (isArray(this.saveEntity[key]) && this.saveEntity[key].length > 0 && this.saveEntity[key][0].url && this.saveEntity[key][0].md5) {
                    if (result[0].parentProperty == 'file') {
                        result[0].parent[result[0].parentProperty] = _.castArray(result[0].parent[result[0].parentProperty])
                        this.saveEntity[key].forEach(c => {
                            c.type = '电子文件'
                            // if (result[0].parent[result[0].parentProperty][0]){
                            //     c.type = result[0].parent[result[0].parentProperty][0].type
                            // }else{
                            //     c.type = result[0].value.type
                            // }                            
                            if (!result[0].parent[result[0].parentProperty].find(file => file.md5 == c.md5)) {
                                result[0].parent[result[0].parentProperty].push(c)
                            }
                        });
                    } else {
                        result[0].value.file = result[0].value.file ? _.castArray(result[0].value.file) : []
                        this.saveEntity[key].forEach(c => {
                            c.type = '电子文件'
                            if (!result[0].value.file.find(file => (c.url && file.url == c.url))) {
                                result[0].value.file.push(c)
                            }
                        });
                    }
                    continue
                }
                result[0].parent[result[0].parentProperty] = this.saveEntity[key]
            } else {
                let path = key.replace('.content', '')
                let result = JSONPath.JSONPath({ path: path, json: jsonData, resultType: 'all' })
                if (result[0]) {
                    result[0].value.content = this.saveEntity[key]
                }
            }
        }
    }


    uploadFinish({ data, attrName, name, size }) {
        if (!this.entity[attrName]) {
            this.entity[attrName] = []
        }
        this.entity[attrName].push({
            'type': attrName,
            'url': 'local:' + data.storagePath,
            'size': size,
            'name': name,
            'md5': data.md5,
            'isNew': true
        })
    }

    toggleCheckbox(event, tile, attr) {
        if (!this.entity[tile.options.attrName]) {
            this.entity[tile.options.attrName] = []
        } else {
            this.entity[tile.options.attrName] = this.entity[tile.options.attrName].split(',')
        }
        if (event.checked) {
            if (this.entity[tile.options.attrName].indexOf(attr) == -1) {
                this.entity[tile.options.attrName].push(attr)
            }
        } else {
            this.entity[tile.options.attrName].splice(this.entity[tile.options.attrName].indexOf(attr), 1)
        }
        this.entity[tile.options.attrName] = this.entity[tile.options.attrName].join(',')
    }

    deleteFile(tile, file, i) {
        this.entity[tile.options.attrName].splice(i, 1)
        this.deletePath.push(file['url'])
    }

    async previewDoc(url) {
        let preview_window = window.open('')
        // let res = await this._RecordInfoService.getDocumentId(this.id, url)
        let objectId = this.id + url
        objectId = objectId.replace('\\', '/')
        preview_window.location.href = `${this.environmentBaseUrl}previewDoc?objectId=${objectId}&recordId=${this.id}`
        // this.router.navigate(['/previewDoc'], { queryParams: { objectId: res } })
    }

    checkNeedProperty(){
        if (!this.getMulModifeProPertyValues) console.warn(ErrorMessage.needGetMulModifeProPertyValues)
        if (!this.getDefaultValue) console.warn(ErrorMessage.getDefaultValue)
        if (!this._DepartmentManageServiceGetList) console.warn(ErrorMessage._DepartmentManageServiceGetList)
        if (!this._chooseUsersAccessServiceGetRoleList) console.warn(ErrorMessage._chooseUsersAccessServiceGetRoleList)
        if (!this._chooseUsersAccessServiceGetUserByDept) console.warn(ErrorMessage._chooseUsersAccessServiceGetUserByDept)
        if (!this._chooseUsersAccessServiceGetUserByRole) console.warn(ErrorMessage._chooseUsersAccessServiceGetUserByRole)
        if (!this._dwClassManageServiceGetMetadataCategoryInfo) console.warn(ErrorMessage._dwClassManageServiceGetMetadataCategoryInfo)
        if (!this.environmentBaseUrl) console.warn(ErrorMessage.environmentBaseUrl)
        if (!this.ApiUrl) console.warn(ErrorMessage.ApiUrl)
        if (!this.baseUrl) console.warn(ErrorMessage.baseUrl)
        if (!this.AuthenticationService) console.warn(ErrorMessage.AuthenticationService)
    }   

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (!this.showTemplateXml) {
            return
        }
        if (this.jsonMetadataTemplate && changes.jsonMetadataTemplate) {
            this.deletePath = []
            this.tiles = []
            this.entity = {}
            this.checkNeedProperty()
            this.getTemplateModule()
        }

    }
}