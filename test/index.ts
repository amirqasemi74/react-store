import './react'
import { Injectable, getFromContainer } from "react-vm";

class Post {
  title: string;
  content: string;

  constructor() {
    this.title = "A Post";
    this.content = "Post content";
  }
}

class User {
  fname: string;
  lname: string;

  constructor(public post: Post) {
    this.fname = "amir";
    this.lname = "qasemi";
  }
}