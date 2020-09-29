import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Transaction } from 'src/app/interfaces/transactions.interface';
import { map } from 'rxjs/operators';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  public id = null;
  public loading = false;
  public yearRange: string;
  public calendar: any;
  public cols = [];
  public transactions: Array<Transaction> = [];

  @ViewChild('dt') table: Table;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.yearRange = ((Number(new Date().getFullYear())) - 5).toString() + ':' + ((Number(new Date().getFullYear())) + 5).toString();
    this.setCalendar();
    this.setCols();
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params.id;
      if (this.id && this.id !== '') {
        this.getTransaction();
      }
    });
  }

  getTransaction() {
    this.loading = true;
    this.http.get<Array<Transaction>>('/api/transactions')
      .pipe(
        map((transactions: Array<Transaction>) => transactions.map(
          trans => {
            const [year = '', month = '', day = ''] = trans.date.split('-');
            return {
              id: trans.id,
              description: trans.description,
              amount: trans.amount,
              date: this.formatDate(new Date(+year, +month - 1, +day)),
              product: trans.product
            };
          }
        ).filter(
          tran => tran.product === +this.id
        ))
      )
      .subscribe(
        response => {
          this.loading = false;
          this.transactions = response;
        }
      );
  }

  setCols() {
    this.cols = [
      { field: 'description', header: 'Descripción' },
      { field: 'amount', header: 'Monto' },
      { field: 'date', header: 'Fecha' }
    ];
  }

  setCalendar() {
    this.calendar = {
      clear: 'Limpiar',
      prevText: 'Anterior',
      nextText: 'Siguiente',
      today: 'Fecha actual',
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr.', 'May', 'Jun',
        'Jul.', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'],
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'],
      dayNamesShort: ['Dom.', 'Lun', 'Mar', 'Mie', 'Jue.', 'Vie', 'Sab'],
      dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
      weekHeader: 'Sem',
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: 1
    };
  }

  onDateSelect(value: Date) {
    this.table.filter(this.formatDate(value), 'date', 'equals');
  }

  formatDate(date: Date) {
    const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
    const day: string = (date.getDate()).toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }

}
