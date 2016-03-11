import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import todoApp from './reducers'

const store = createStore(todoApp);
 
const Link = ({
  active,
  children,
  onClick
}) => {
  if(active) {
    return <span>{children}</span>;
  }
  return (
    <a href='#'
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
    {children}
    </a>
  )
}

class FilterLink extends Component {

  /*
  ** unless you subscribe to it, the 
  ** store.getState() will get stale 
  ** values when the component re-renders.
  ** store.subscribe() returns a reference to store.unsubscribe()
  ** hence we can save this reference so that it can be called in the 
  ** componentWillUnmount() function later when the component unmounts
  *
  */

  componentDidMount() {
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    /* get store state, not react state */
    const state = store.getState(); 

    return (
      <Link
        active = {
          props.filter 
            === state.visibilityFilter
        }
        onClick={() =>
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
          })
        }
        >
          {props.children}
        </Link> 
    );
  }
}

/* Converted from a function that passes down props 
** to only presentational.
*/
const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'
    >
    All 
    </FilterLink>
    {' '}
    <FilterLink
      filter='SHOW_ACTIVE'
    >
    Active
    </FilterLink>
    {' '}
    <FilterLink
      filter='SHOW_COMPLETED'
    >
    Completed
    </FilterLink>
  </p>

)


/*
** Todo - PRESENTATIONAL COMPONENT Todo using 
** "stateless functional component syntax"
** One of the things to be done is to seprate out the 
** presentationl and the Behavioral components. 
** Functionl components can be defined even for the 
** presentational stuff which actually don't have any behavior 
** hence the name functional may sound confusing but 
** read this article 
** https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components
*/ 

const Todo = ({
  onClick,
  completed,
  text
}) => (

  <li 
    onClick={onClick} 
      style={{ 
        textDecoration:
          completed ?
            'line-through':
            'none'
      }}>
    {text}
  </li>
);

/*
** TodoList - PRESENTATIONAL COMPONENT Todo using 
** "stateless functional component syntax" 
** NOTE: Since this is a presentational component
** the onClick behavior does not define any behavior. 
** Instead, it relies on being passed the behavior as a
** prop "onTodoClick".
** 
** Also, we will now need a "Container component" to 
** pass the data from the store and to specify the 
** behavior.
*/

const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ul>
    {
      todos.map(todo => 
        <Todo 
          key={todo.id}
          {...todo}
          onClick={() => onTodoClick(todo.id)}
        />
    )}
  </ul>
);


const AddTodo = ({
  onAddClick
}) => {
  let input;
  return(
    <div>
      <input ref={node => {
            input = node;
          }} />
      <button onClick={() => {
        onAddClick(input.value); 
        input.value = '';
      }}>
      Add Todo 
      </button>
    </div>
  );
};

/*
** NOTE: the following is just a utility function, 
** versus a functional component such as FilterLink
** I am stating the obvious here but this is so 
** as to just bring your attention to the little details 
** because with similarities in syntax, the difference 
** in purpose is sometimes not obvious.
*/

const getVisibleTodos = (
  todos, 
  filter
  ) => {
    switch (filter) {
      case 'SHOW_ALL':
        return todos;
      case 'SHOW_COMPLETED':
        return todos.filter( t => t.completed);
      case 'SHOW_ACTIVE':
        return todos.filter( t => !t.completed);
      default:
        return todos;
    }
}



/*
** CONTAINER COMPONENT
** FOr this lesson, this is the top level container 
** component which can be used to define the behavior
*/ 
let nextTodoId = 0;
class TodoApp extends Component {
  render() {
    /*
    ** Destructure the todos and visibility filter from the props
    ** to it can be used directly as todos and visibility filter
    ** instead ot this.props.todos and this.props.visibilityFilter
    */
    const {
      todos, 
      visibilityFilter
    } = this.props;

    const visibleTodos = getVisibleTodos(
      todos,
      visibilityFilter
    );

    return (
      <div>
        <AddTodo 
          onAddClick={text => 
            store.dispatch({
              type: 'ADD_TODO',
              id: nextTodoId++,
              text
            })
          }
        />
        <TodoList 
          todos={visibleTodos}
          onTodoClick={id => 
            store.dispatch({
              type:'TOGGLE_TODO',
              id
            })
          } 
        />
        <Footer />
      </div>
    );
  }
}

/*
** the todos could have been passed as a prop and 
** same for filter, but its easier to
** the state as a spread over all the state fields
** Every state field is passed as a prop to the TodoApp component
*/ 
const render = () => {
  ReactDOM.render(
    <TodoApp {...store.getState()}/>,
    document.getElementById('root')
  );
}

render()
store.subscribe(render)
