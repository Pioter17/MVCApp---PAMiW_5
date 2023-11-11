import { Component, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs';
import { Movie, MovieResponse } from '../../interfaces/movie';
import { ApiMovieService } from '../../services/api-movie-service.service';
import { AddMovieDialogComponent } from '../add-movie-dialog/add-movie-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-display-movies',
  templateUrl: './display-movies.component.html',
  styleUrls: ['./display-movies.component.scss']
})
export class DisplayMoviesComponent {
  show = false;
  filtered = false;
  movies: Movie[] = [];
  displayedMovies: Movie[] = [];
  search: string;
  displayedColumns: string[] = ['tytul', 'rezyser', 'producent', 'dlugosc', 'ocena', 'buttons'];
  @ViewChild(MatTable) table: MatTable<Movie>;

  constructor(
    private dialog: MatDialog,
  ){}

  api = inject(ApiMovieService);

  showMovies(){
    this.show = true;
  }

  hideMovies(){
    this.show = false;
  }

  getMovies(){

    this.filtered = false;
    this.movies = [];
    this.displayedMovies = [];
    this.showMovies();
    this.api.getMovies().subscribe((res) => {
      res.forEach((elem) => {
        this.movies.push(elem);
      })
      for(let i=1; i<11;i++){
        this.displayedMovies.push(this.movies[i])
      }
      this.table.renderRows();
    })
  }

  getFilteredMovies(){
    this.filtered = true;
    this.movies = [];
    this.displayedMovies = [];
    this.api.getFilteredMovies(this.search).subscribe((res) => {
      res.forEach((elem) => {
        this.movies.push(elem);
      })
      for(let i=1; i<11;i++){
        this.displayedMovies.push(this.movies[i])
      }
      this.table.renderRows();
    })
  }

  addMovie(){
    const dialogRef = this.dialog.open(AddMovieDialogComponent, {
      minWidth: '400px',
      minHeight: '300px',
    });

    dialogRef.afterClosed().pipe(
      filter((res) => !!res),
    ).subscribe((res) => {
      this.api.postMovie(res).subscribe(
        (response) => {
          let newMovie: Movie = response.data;
          this.movies.push(newMovie);
          this.table.renderRows();
        },);
    });
  }

  updateMovie(id: number, index: number){
    const dialogRef = this.dialog.open(AddMovieDialogComponent, {
      minWidth: '400px',
      minHeight: '300px',
      data:{
        ...this.movies[index],
        isEdit: true,
      }
    });

    dialogRef.afterClosed().pipe(
      filter((res) => !!res),
    ).subscribe((res) => {
      this.api.putMovie(id, res).subscribe(
        (response : MovieResponse) => {
          let newMovie: Movie = response.data;
          console.log(newMovie)
          this.displayedMovies[index] = newMovie;
          this.table.renderRows();
        }
      )
    });
  }

  deleteMovie(id: number, index: number){
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      minWidth: '200px',
      minHeight: '100px',
    });

    dialogRef.afterClosed().pipe(
      filter((res) => !!res),
    ).subscribe(() => {
      this.api.deleteMovie(id).subscribe(
        (response) => {
          this.table.renderRows();
        },);
      this.displayedMovies.splice(index, 1);
    });
  }

  length = 40
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10];

  hidePageSize = true;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent: PageEvent;

  handlePageEvent(e: PageEvent) {
    this.displayedMovies = [];
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    for(let i=this.pageIndex*this.pageSize+1; i<this.pageIndex*this.pageSize+11;i++){
      if(this.movies[i]){
        this.displayedMovies.push(this.movies[i])
      }

    }
  }
}
