import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Observable, ReplaySubject } from 'rxjs';
import { PolicyEngineService } from 'src/app/services/policy-engine.service';
import { ImportType } from 'interfaces';

/**
 * Dialog for creating policy.
 */
@Component({
  selector: 'import-policy-dialog',
  templateUrl: './import-policy-dialog.component.html',
  styleUrls: ['./import-policy-dialog.component.css']
})
export class ImportPolicyDialog {
  importType?: ImportType;
  dataForm = this.fb.group({
    timestamp: ['']
  });
  callbackFileImport: any;
  loading: boolean = false;

  private _isimportTypeSelected$ = new ReplaySubject<boolean>(1);

  constructor(
    public dialogRef: MatDialogRef<ImportPolicyDialog>,
    private fb: FormBuilder,
    private policyEngineService: PolicyEngineService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this._isimportTypeSelected$.next(false);
  }

  public get isImportTypeSelected$(): Observable<boolean> {
    return this._isimportTypeSelected$;
  }

  ngOnInit() {
    this.callbackFileImport = this.data.callbackFileImport;
    this.setImportType(ImportType.IPFS);
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    if (!this.dataForm.valid) {
      return;
    }
    this.loading = true;
    const messageId = this.dataForm.get('timestamp')?.value;

    this.policyEngineService.previewByMessage(messageId)
      .subscribe(result => {
        this.dialogRef.close({
          messageId: messageId,
          policy: result
        });
      }, error => {
        this.loading = false;
      });
  }

  setImportType(importType: ImportType) {
    this.importType = importType;
    this._isimportTypeSelected$.next(true);
  }

  importFromFile() {
    this.dialogRef.close();
    this.callbackFileImport();
  }
}