/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CommentProcessService } from '../services/comment-process.service';
import { CommentContentService } from '../services/comment-content.service';
import { CommentModel } from '../models/comment.model';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'adf-add-comment',
    templateUrl: './add-comment.component.html',
    styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnChanges {

    /** The numeric ID of the task. */
    @Input()
    taskId: string;

    /** The numeric ID of the node. */
    @Input()
    nodeId: string;

    @Input()
    parentId: string;

    /** Emitted when an error occurs while displaying/adding a comment. */
    @Output()
    error: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    success: EventEmitter<CommentModel> = new EventEmitter<CommentModel>();

    message: string;

    beingAdded: boolean = false;

    constructor(private commentProcessService: CommentProcessService, private commentContentService: CommentContentService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.taskId = null;
        this.nodeId = null;
        this.parentId = null;

        this.taskId = changes['taskId'] ? changes['taskId'].currentValue : null;
        this.nodeId = changes['nodeId'] ? changes['nodeId'].currentValue : null;
        this.parentId = changes['parentId'] ? changes['parentId'].currentValue : null;
    }

    add(): void {
        if (this.message && this.message.trim() && !this.beingAdded) {
            let comment = this.sanitize(this.message);
            comment = this.addParentId(comment);

            this.beingAdded = true;
            if (this.isATask()) {
                this.commentProcessService.addTaskComment(this.taskId, comment)
                    .subscribe(
                        (res: CommentModel) => {
                            this.success.emit(res);
                            this.message = '';
                            this.beingAdded = false;

                        },
                        (err) => {
                            this.error.emit(err);
                            this.beingAdded = false;
                        }
                    );
            }

            if (this.isANode()) {
                this.commentContentService.addNodeComment(this.nodeId, comment)
                    .subscribe(
                        (res: CommentModel) => {
                            this.success.emit(res);
                            this.message = '';
                            this.beingAdded = false;

                        },
                        (err) => {
                            this.error.emit(err);
                            this.beingAdded = false;
                        }
                    );
            }
        }
    }

    clear(): void {
        this.message = '';
    }

    isATask(): boolean {
        return this.taskId ? true : false;
    }

    isANode(): boolean {
        return this.nodeId ? true : false;
    }

    private sanitize(input: string) {
        return input.replace(/<[^>]+>/g, '')
            .replace(/^\s+|\s+$|\s+(?=\s)/g, '')
            .replace(/\r?\n/g, '<br/>');
    }

    private addParentId(message): string {
        if (this.parentId) {
            message = `$$$REPLY:${this.parentId}$$$` + message;
        }

        return message;
    }
}
