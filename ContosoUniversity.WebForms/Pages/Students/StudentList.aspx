<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="StudentList.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Students.StudentListPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Students</h2>

    <asp:UpdatePanel ID="SearchPanel" runat="server">
        <ContentTemplate>
            <div class="search-bar">
                <asp:TextBox ID="txtSearch" runat="server" placeholder="Search by name..." />
                <asp:Button ID="btnSearch" runat="server" Text="Search" OnClick="btnSearch_Click" />
                <asp:Button ID="btnClear" runat="server" Text="Clear" OnClick="btnClear_Click" />
            </div>

            <asp:GridView ID="gvStudents" runat="server"
                AutoGenerateColumns="False"
                DataKeyNames="StudentID"
                AllowPaging="True"
                AllowSorting="True"
                PageSize="10"
                OnPageIndexChanging="gvStudents_PageIndexChanging"
                OnSorting="gvStudents_Sorting"
                OnRowDeleting="gvStudents_RowDeleting"
                CssClass="data-grid"
                EmptyDataText="No students found.">
                <Columns>
                    <asp:BoundField DataField="StudentID" HeaderText="ID" SortExpression="StudentID" ReadOnly="True" />
                    <asp:BoundField DataField="LastName" HeaderText="Last Name" SortExpression="LastName" />
                    <asp:BoundField DataField="FirstMidName" HeaderText="First Name" SortExpression="FirstMidName" />
                    <asp:BoundField DataField="EnrollmentDate" HeaderText="Enrollment Date"
                        DataFormatString="{0:d}" SortExpression="EnrollmentDate" />
                    <asp:TemplateField HeaderText="Enrollments">
                        <ItemTemplate>
                            <%# Eval("Enrollments.Count") %>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:HyperLinkField Text="Edit"
                        DataNavigateUrlFields="StudentID"
                        DataNavigateUrlFormatString="StudentEdit.aspx?id={0}" />
                    <asp:CommandField ShowDeleteButton="True" />
                </Columns>
            </asp:GridView>

            <asp:Label ID="lblMessage" runat="server" CssClass="message" Visible="false" />
        </ContentTemplate>
    </asp:UpdatePanel>

    <p><a href="StudentEdit.aspx">Add New Student</a></p>
</asp:Content>
