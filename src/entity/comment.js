import {Edit, SimpleForm, TextInput, ReferenceInput, SelectInput} from 'react-admin'

export const CommentEdit = props => (
    <Edit {...props}>
        <SimpleForm>
            <ReferenceInput source="postId" reference="posts">
                <SelectInput optionText="title" />
            </ReferenceInput>
            <TextInput source="id" />
            <TextInput source="name" />
            <TextInput source="email" />
            <TextInput source="body" />
        </SimpleForm>
    </Edit>
)