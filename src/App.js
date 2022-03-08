import * as React from "react";
import {Admin, EditGuesser, ListGuesser, Resource} from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import {UserEdit, UserList} from "./entity/user";
import {CommentEdit} from "./entity/comment";

const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
const App = () => <Admin dataProvider={dataProvider}>
  <Resource name="users" list={UserList} edit={UserEdit} />
  <Resource name="posts" list={ListGuesser} />
  <Resource name="comments" list={ListGuesser} edit={CommentEdit} />
</Admin>

export default App;
